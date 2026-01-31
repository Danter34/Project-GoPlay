using Goplay_API.Model.Domain;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace Goplay_API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options ) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Field> Fields { get; set; }
        public DbSet<SportType> SportTypes { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<TimeSlot> TimeSlots { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<OwnerProfile> OwnerProfiles { get; set; }
        public DbSet<BookingTimeSlot> BookingTimeSlots { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ContactMessage> ContactMessages { get; set; }
        public DbSet<lh> lhs { get; set; }
        public DbSet<News> News { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
               .HasOne(u => u.OwnerProfile)
               .WithOne(o => o.User)
               .HasForeignKey<OwnerProfile>(o => o.UserId)
               .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Field>()
               .HasOne(f => f.OwnerProfile)
               .WithMany(o => o.Fields)
               .HasForeignKey(f => f.OwnerProfileId)
               .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
            .HasOne(b => b.Payment)
            .WithOne(p => p.Booking)
            .HasForeignKey<Payment>(p => p.BookingId);

            // Contact - Sender
            modelBuilder.Entity<Contact>()
                .HasOne(c => c.Sender)
                .WithMany(u => u.SentContacts)
                .HasForeignKey(c => c.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            // Contact - Receiver
            modelBuilder.Entity<Contact>()
                .HasOne(c => c.Receiver)
                .WithMany(u => u.ReceivedContacts)
                .HasForeignKey(c => c.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Image>()
            .HasOne(i => i.Field)
            .WithMany(f => f.Images)
            .HasForeignKey(i => i.FieldId)
            .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BookingTimeSlot>()
            .HasKey(bts => new { bts.BookingId, bts.SlotId });

            modelBuilder.Entity<BookingTimeSlot>()
                .HasOne(bts => bts.Booking)
                .WithMany(b => b.BookingTimeSlots)
                .HasForeignKey(bts => bts.BookingId);

            modelBuilder.Entity<BookingTimeSlot>()
                .HasOne(bts => bts.TimeSlot)
                .WithMany(ts => ts.BookingTimeSlots)
                .HasForeignKey(bts => bts.SlotId);

            modelBuilder.Entity<Review>()
                 .HasOne(r => r.Booking)
                 .WithMany() // Một booking có nhiều review (thực tế là 1, nhưng cấu hình này ok)
                 .HasForeignKey(r => r.BookingId)
                 .OnDelete(DeleteBehavior.NoAction); // [QUAN TRỌNG] Ngắt vòng lặp tại đây

            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.NoAction); // Ngắt vòng lặp tại User luôn cho chắc

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Field)
                .WithMany(f => f.Reviews)
                .HasForeignKey(r => r.FieldId)
                .OnDelete(DeleteBehavior.NoAction);


            base.OnModelCreating(modelBuilder);

        }
    }

}
