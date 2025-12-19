using System.Text.Json.Serialization;

namespace Goplay_API.Model.DTO
{
    public class PaymentRequest
    {
        [JsonPropertyName("bookingId")]
        public int BookingId { get; set; }

        [JsonPropertyName("method")]
        public string Method { get; set; }
    }
}
