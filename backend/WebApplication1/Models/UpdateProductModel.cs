namespace WebApplication1.Models
{
    public class UpdateProductModel
    {
        public int ProductID { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Stock { get; set; }
        public double Price { get; set; }
        public List<string>? Colors { get; set; }
        public List<string>? Sizes { get; set; }
        public List<IFormFile>? Images { get; set; }
        public string? Description { get; set; }
    }
}
