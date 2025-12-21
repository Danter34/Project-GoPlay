using Goplay_API.Model.Domain;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Goplay_API.Model.Domain
{
    public enum PaymentMethod
    {
        Momo,
        VnPay,
        Cash
    }

    public enum PaymentStatus
    {
        ChờThanhToán,
        ĐãThanhToán,
        ThấtBại
    }

    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }

        public int BookingId { get; set; }
        [ForeignKey("BookingId")]
        public Booking Booking { get; set; }

        public decimal Amount { get; set; }

        public PaymentMethod Method { get; set; }
        public PaymentStatus Status { get; set; } = PaymentStatus.ChờThanhToán;

        public string? ExternalOrderId { get; set; }
        public string? MomoOrderId { get; set; } 
        public string? PayUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}