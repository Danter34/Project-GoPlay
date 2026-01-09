using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goplay_API.Migrations
{
    /// <inheritdoc />
    public partial class uddecription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Fields",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Fields");
        }
    }
}
