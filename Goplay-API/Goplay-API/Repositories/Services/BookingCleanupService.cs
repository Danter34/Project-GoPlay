using Goplay_API.Data;
using Microsoft.EntityFrameworkCore;

namespace Goplay_API.BackgroundServices
{
    public class BookingCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BookingCleanupService> _logger;

        public BookingCleanupService(IServiceProvider serviceProvider, ILogger<BookingCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Chạy vòng lặp kiểm tra định kỳ
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("BookingCleanupService running at: {time}", DateTimeOffset.Now);

                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                        
                        var now = DateTime.UtcNow.AddHours(7);

                  
                        var pendingBookings = await context.Bookings
                            .Include(b => b.BookingTimeSlots)
                                .ThenInclude(bts => bts.TimeSlot)
                            .Where(b => (b.Status == "Confirmed" || b.Status == "Pending")
                                     && b.BookingDate.Date <= now.Date)
                            .ToListAsync(stoppingToken);

                        if (pendingBookings.Any())
                        {
                            foreach (var booking in pendingBookings)
                            {
                                
                                var maxEndTimeSlot = booking.BookingTimeSlots
                                    .Select(bts => bts.TimeSlot.EndTime)
                                    .OrderByDescending(t => t)
                                    .FirstOrDefault();

                                
                                if (maxEndTimeSlot == default(TimeSpan)) continue;

                               
                                DateTime bookingFullEndDateTime = booking.BookingDate.Date + maxEndTimeSlot;

                                
                                if (now > bookingFullEndDateTime.AddMinutes(30))
                                {
                                    booking.Status = "Cancelled";
                                   

                                    _logger.LogInformation($"Auto canceling Booking #{booking.BookingId}. " +
                                                         $"Reason: Overdue checkout. " +
                                                         $"Max EndTime was: {bookingFullEndDateTime:HH:mm}, Now is: {now:HH:mm}");
                                }
                            }

                            // 6. Lưu thay đổi vào DB nếu có đơn nào bị sửa đổi
                            if (context.ChangeTracker.HasChanges())
                            {
                                await context.SaveChangesAsync(stoppingToken);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred in BookingCleanupService");
                }

                // Chờ 15 phút quét lại 1 lần (để cập nhật trạng thái kịp thời hơn là 1 tiếng)
                await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
            }
        }
    }
}