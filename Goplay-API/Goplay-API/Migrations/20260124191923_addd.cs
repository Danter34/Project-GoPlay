using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goplay_API.Migrations
{
    /// <inheritdoc />
    public partial class addd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FieldId",
                table: "Contacts",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_FieldId",
                table: "Contacts",
                column: "FieldId");

            migrationBuilder.AddForeignKey(
                name: "FK_Contacts_Fields_FieldId",
                table: "Contacts",
                column: "FieldId",
                principalTable: "Fields",
                principalColumn: "FieldId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_Fields_FieldId",
                table: "Contacts");

            migrationBuilder.DropIndex(
                name: "IX_Contacts_FieldId",
                table: "Contacts");

            migrationBuilder.DropColumn(
                name: "FieldId",
                table: "Contacts");
        }
    }
}
