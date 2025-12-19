using Goplay_API.Model.DTO;

namespace Goplay_API.Repositories.Interface
{
    public interface IPaymentRepository
    {
        Task<PaymentResponse> CreatePaymentAsync(PaymentRequest dto);

        // MoMo
        Task<bool> HandleMomoReturnAsync(string orderId, string resultCode);
        Task<bool> HandleMomoNotifyAsync(string orderId, string resultCode);

        // VNPay
        Task<PaymentResponse> CreateVnPayPaymentAsync(PaymentRequest dto);
        Task<bool> HandleVnPayReturnAsync(IDictionary<string, string> queryParams);

        // Cash
        Task<bool> ConfirmCashPaymentAsync(int bookingId);
    }
}