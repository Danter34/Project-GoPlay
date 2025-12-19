using Goplay_API.Model.Domain;

namespace Goplay_API.Model.DTO
{
    public class OwnerProfileResponseDTO
    {

        public int OwnerProfileId { get; set; }
        public int UserId { get; set; }

        public string IdentityNumber { get; set; }
        public string? TaxCode { get; set; }
        public string Phone { get; set; }
        public string BusinessName { get; set; }

        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }

        public OwnerProfileResponseDTO(OwnerProfile p)
        {
            OwnerProfileId = p.OwnerProfileId;
            UserId = p.UserId;
            IdentityNumber = p.IdentityNumber;
            TaxCode = p.TaxCode;
            Phone = p.Phone;
            BusinessName = p.BusinessName;
            Status = p.Status;
            CreatedAt = p.CreatedAt;
        }

    }
}
