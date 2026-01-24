using Goplay_API.Data;
using Goplay_API.Helpers;
using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace Goplay_API.Repositories.Services
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public PaymentRepository(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        //MOMO LOGIC
        public async Task<PaymentResponse> CreatePaymentAsync(PaymentRequest dto)
        {
            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.BookingId == dto.BookingId);
            if (booking == null) throw new Exception("Booking not found");

            // Check Enum Status
            var existingPayment = await _context.Payments
                .FirstOrDefaultAsync(p => p.BookingId == dto.BookingId && p.Status == PaymentStatus.ĐãThanhToán);
            if (existingPayment != null) throw new Exception("Booking already paid");

            // Config MoMo
            var momoConfig = _config.GetSection("MomoSettings");
            var endpoint = momoConfig["Endpoint"];
            var partnerCode = momoConfig["PartnerCode"];
            var accessKey = momoConfig["AccessKey"];
            var secretKey = momoConfig["SecretKey"];
            var returnUrl = momoConfig["ReturnUrl"];
            var notifyUrl = momoConfig["NotifyUrl"];

            // Data request
            string orderInfo = $"Dat coc 30% cho booking #{booking.BookingId}";
            decimal depositAmount = booking.TotalPrice * 0.3m;
            string amount = depositAmount.ToString("0");
            string momoOrderId = DateTime.Now.Ticks.ToString();
            string requestId = momoOrderId;
            string requestType = "captureWallet";

            // Signature
            string rawHash = $"accessKey={accessKey}&amount={amount}&extraData=&ipnUrl={notifyUrl}&orderId={momoOrderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={returnUrl}&requestId={requestId}&requestType={requestType}";
            string signature = CreateSignature(rawHash, secretKey);

            // Body request
            var body = new
            {
                partnerCode,
                partnerName = "Goplay",
                storeId = "GoplayStore",
                requestId,
                amount,
                orderId = momoOrderId,
                orderInfo,
                redirectUrl = returnUrl,
                ipnUrl = notifyUrl,
                lang = "vi",
                requestType,
                extraData = "",
                signature
            };

            // Call API
            using var client = new HttpClient();
            var response = await client.PostAsync(endpoint, new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json"));
            var json = await response.Content.ReadAsStringAsync();
            dynamic momoResponse = JsonConvert.DeserializeObject(json)!;

            // Lưu DB dùng Enum
            var payment = new Payment
            {
                BookingId = booking.BookingId,
                MomoOrderId = momoOrderId,
                ExternalOrderId = momoOrderId,
                Amount = depositAmount,

                Method = PaymentMethod.Momo,      
                Status = PaymentStatus.ChờThanhToán,   
                
                PayUrl = momoResponse.payUrl
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return new PaymentResponse
            {
                PaymentId = payment.PaymentId,
                Amount = payment.Amount,
                PayUrl = payment.PayUrl,
                Status = payment.Status.ToString() 
            };
        }

        public async Task<bool> HandleMomoReturnAsync(string orderId, string resultCode)
        {
            var payment = await _context.Payments
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.MomoOrderId == orderId);

            if (payment == null) return false;

            if (resultCode == "0") 
            {
                payment.Status = PaymentStatus.ĐãThanhToán; 
                if (payment.Booking != null)
                {
                    payment.Booking.Status = "Pending";
                }
                await _context.SaveChangesAsync();
                return true;
            }
            else // Thất bại
            {
                payment.Status = PaymentStatus.ThấtBại;

                // [MỚI] Hủy luôn Booking nếu thanh toán thất bại
                if (payment.Booking != null)
                {
                    payment.Booking.Status = "Cancelled";
                }

                await _context.SaveChangesAsync();
                return false;
            }
        }

        public async Task<bool> HandleMomoNotifyAsync(string orderId, string resultCode)
        {
            return await HandleMomoReturnAsync(orderId, resultCode);
        }

        private string CreateSignature(string rawData, string secretKey)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
            byte[] hashValue = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            return BitConverter.ToString(hashValue).Replace("-", "").ToLower();
        }
        public async Task<PaymentResponse> CreateVnPayPaymentAsync(PaymentRequest dto)
        {
            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.BookingId == dto.BookingId);
            if (booking == null) throw new Exception("Booking not found");

            var config = _config.GetSection("VnPaySettings");
            string tmnCode = config["TmnCode"];
            string hashSecret = config["HashSecret"];
            string baseUrl = config["BaseUrl"];
            string returnUrl = config["ReturnUrl"];
            decimal depositAmount = booking.TotalPrice * 0.3m;
            var vnpParams = new SortedDictionary<string, string>
            {
                {"vnp_Version", "2.1.0"},
                {"vnp_Command", "pay"},
                {"vnp_TmnCode", tmnCode},
                {"vnp_Amount", ((long)(depositAmount * 100)).ToString()},
                {"vnp_CurrCode", "VND"},
                {"vnp_TxnRef", DateTime.Now.Ticks.ToString()},
                {"vnp_OrderInfo", $"Dat coc 30% cho booking #{booking.BookingId}"},
                {"vnp_OrderType", "other"},
                {"vnp_Locale", "vn"},
                {"vnp_ReturnUrl", returnUrl},
                {"vnp_IpAddr", "127.0.0.1"},
                {"vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss")}
            };

            var rawData = string.Join("&", vnpParams.Where(x => !string.IsNullOrEmpty(x.Value)).Select(x => $"{x.Key}={WebUtility.UrlEncode(x.Value)}"));
            string secureHash;
            using (var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(hashSecret)))
            {
                byte[] hashValue = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawData));
                secureHash = BitConverter.ToString(hashValue).Replace("-", "").ToUpper();
            }

            var query = string.Join("&", vnpParams.Where(x => !string.IsNullOrEmpty(x.Value)).Select(x => $"{x.Key}={WebUtility.UrlEncode(x.Value)}"));
            string paymentUrl = $"{baseUrl}?{query}&vnp_SecureHash={secureHash}";

            // Lưu DB dùng Enum
            var payment = new Payment
            {
                BookingId = booking.BookingId,
                MomoOrderId = vnpParams["vnp_TxnRef"],
                ExternalOrderId = vnpParams["vnp_TxnRef"],
                Amount = depositAmount,

                Method = PaymentMethod.VnPay,     
                Status = PaymentStatus.ChờThanhToán,   
                
                PayUrl = paymentUrl
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return new PaymentResponse
            {
                PaymentId = payment.PaymentId,
                Amount = payment.Amount,
                PayUrl = payment.PayUrl,
                Status = payment.Status.ToString()
            };
        }

        public async Task<bool> HandleVnPayReturnAsync(IDictionary<string, string> queryParams)
        {
            if (!queryParams.TryGetValue("vnp_TxnRef", out string? orderId) ||
                !queryParams.TryGetValue("vnp_ResponseCode", out string? responseCode))
                return false;

            var payment = await _context.Payments
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.MomoOrderId == orderId);

            if (payment == null) return false;

            if (responseCode == "00")
            {
                payment.Status = PaymentStatus.ChờThanhToán;
                if (payment.Booking != null)
                {
                    payment.Booking.Status = "Pending";
                }
                await _context.SaveChangesAsync();
                return true;
            }
            else // Thất bại
            {
                payment.Status = PaymentStatus.ThấtBại;

                // [MỚI] Hủy luôn Booking nếu thanh toán thất bại
                if (payment.Booking != null)
                {
                    payment.Booking.Status = "Cancelled";
                }

                await _context.SaveChangesAsync();
                return false;
            }
        }

        // CASH LOGIC
        public async Task<bool> ConfirmCashPaymentAsync(int bookingId)
        {
            var booking = await _context.Bookings.Include(b => b.Payment).FirstOrDefaultAsync(b => b.BookingId == bookingId);
            if (booking == null) return false;

            if (booking.Payment == null)
            {
                var payment = new Payment
                {
                    BookingId = booking.BookingId,
                    Amount = booking.TotalPrice,
                    
                    Method = PaymentMethod.Cash,    
                    Status = PaymentStatus.ĐãThanhToán,   
                    
                    CreatedAt = DateTime.Now
                };
                _context.Payments.Add(payment);
            }
            else
            {
                booking.Payment.Status = PaymentStatus.ĐãThanhToán;
            }

            booking.Status = "Confirmed";
            await _context.SaveChangesAsync();
            return true;
        }
    }
}