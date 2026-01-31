using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goplay_API.Migrations
{
    /// <inheritdoc />
    public partial class removeoldlogic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookingServiceItems");

            migrationBuilder.DropTable(
                name: "Services");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    ServiceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OwnerProfileId = table.Column<int>(type: "int", nullable: false),
                    SportTypeId = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ServiceName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.ServiceId);
                    table.ForeignKey(
                        name: "FK_Services_OwnerProfiles_OwnerProfileId",
                        column: x => x.OwnerProfileId,
                        principalTable: "OwnerProfiles",
                        principalColumn: "OwnerProfileId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Services_SportTypes_SportTypeId",
                        column: x => x.SportTypeId,
                        principalTable: "SportTypes",
                        principalColumn: "SportTypeId");
                });

            migrationBuilder.CreateTable(
                name: "BookingServiceItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingId = table.Column<int>(type: "int", nullable: false),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    PriceAtBooking = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingServiceItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookingServiceItems_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "BookingId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BookingServiceItems_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "ServiceId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookingServiceItems_BookingId",
                table: "BookingServiceItems",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_BookingServiceItems_ServiceId",
                table: "BookingServiceItems",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Services_OwnerProfileId",
                table: "Services",
                column: "OwnerProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Services_SportTypeId",
                table: "Services",
                column: "SportTypeId");
        }
    }
}
