//using System.Data;
//using System.Data.SqlClient;
//using WebApplication1.Models;

//namespace WebApplication1.DataAccess
//{
//    public class DAReturnRequest
//    {
//        private readonly string _connectionString;

//        public DAReturnRequest(IConfiguration configuration)
//        {
//            _connectionString = configuration.GetConnectionString("DefaultConnection");
//        }

//        public async Task<bool> SubmitReturnAsync(ReturnRequestModel dto)
//        {
//            using SqlConnection conn = new SqlConnection(_connectionString);
//            string query = @"INSERT INTO ReturnRequest 
//                            (OrderID, ProductID, FullName, Email, PhoneNumber, Reason, ProductCondition, Comment, ImageUrl) 
//                            VALUES 
//                            (@OrderID, @ProductID, @FullName, @Email, @PhoneNumber, @Reason, @ProductCondition, @Comment, @ImageUrl)";
//            using SqlCommand cmd = new SqlCommand(query, conn);
//            cmd.Parameters.AddWithValue("@OrderID", dto.OrderID);
//            cmd.Parameters.AddWithValue("@ProductID", dto.ProductID);
//            cmd.Parameters.AddWithValue("@FullName", dto.FullName);
//            cmd.Parameters.AddWithValue("@Email", dto.Email);
//            cmd.Parameters.AddWithValue("@PhoneNumber", dto.PhoneNumber);
//            cmd.Parameters.AddWithValue("@Reason", dto.Reason);
//            cmd.Parameters.AddWithValue("@ProductCondition", dto.ProductCondition);
//            cmd.Parameters.AddWithValue("@Comment", dto.Comment ?? (object)DBNull.Value);
//            cmd.Parameters.AddWithValue("@ImageUrl", dto.ImageUrl ?? (object)DBNull.Value);

//            await conn.OpenAsync();
//            return await cmd.ExecuteNonQueryAsync() > 0;
//        }

//        public async Task<List<ReturnRequestModel>> GetAllReturnsAsync()
//        {
//            var list = new List<ReturnRequestModel>();
//            using SqlConnection conn = new SqlConnection(_connectionString);
//            string query = "SELECT * FROM ReturnRequest ORDER BY CreatedAt DESC";
//            using SqlCommand cmd = new SqlCommand(query, conn);
//            await conn.OpenAsync();
//            using SqlDataReader reader = await cmd.ExecuteReaderAsync();

//            while (await reader.ReadAsync())
//            {
//                list.Add(new ReturnRequestModel
//                {
//                    ReturnID = reader.GetInt32(reader.GetOrdinal("ReturnID")),
//                    OrderID = reader.GetInt32(reader.GetOrdinal("OrderID")),
//                    ProductID = reader.GetInt32(reader.GetOrdinal("ProductID")),
//                    FullName = reader.GetString(reader.GetOrdinal("FullName")),
//                    Email = reader.GetString(reader.GetOrdinal("Email")),
//                    PhoneNumber = reader.GetString(reader.GetOrdinal("PhoneNumber")),
//                    Reason = reader.GetString(reader.GetOrdinal("Reason")),
//                    ProductCondition = reader.GetString(reader.GetOrdinal("ProductCondition")),
//                    Comment = reader["Comment"] as string,
//                    ImageUrl = reader["ImageUrl"] as string,
//                    Status = reader.GetString(reader.GetOrdinal("Status"))
//                });
//            }

//            return list;
//        }
//        public async Task<List<ReturnRequestModel>> GetReturnsByOrderIdAsync(int orderId)
//        {
//            var list = new List<ReturnRequestModel>();
//            using SqlConnection conn = new SqlConnection(_connectionString);
//            string query = "SELECT * FROM ReturnRequest WHERE OrderID = @OrderID ORDER BY CreatedAt DESC";
//            using SqlCommand cmd = new SqlCommand(query, conn);
//            cmd.Parameters.AddWithValue("@OrderID", orderId);
//            await conn.OpenAsync();

//            using SqlDataReader reader = await cmd.ExecuteReaderAsync();
//            while (await reader.ReadAsync())
//            {
//                list.Add(new ReturnRequestModel
//                {
//                    ReturnID = reader.GetInt32(reader.GetOrdinal("ReturnID")),
//                    OrderID = reader.GetInt32(reader.GetOrdinal("OrderID")),
//                    ProductID = reader.GetInt32(reader.GetOrdinal("ProductID")),
//                    FullName = reader.GetString(reader.GetOrdinal("FullName")),
//                    Email = reader.GetString(reader.GetOrdinal("Email")),
//                    PhoneNumber = reader.GetString(reader.GetOrdinal("PhoneNumber")),
//                    Reason = reader.GetString(reader.GetOrdinal("Reason")),
//                    ProductCondition = reader.GetString(reader.GetOrdinal("ProductCondition")),
//                    Comment = reader["Comment"] as string,
//                    ImageUrl = reader["ImageUrl"] as string,
//                    Status = reader.GetString(reader.GetOrdinal("Status"))
//                });
//            }

//            return list;
//        }


//        public async Task<bool> UpdateReturnStatusAsync(int returnId, string newStatus)
//        {
//            using SqlConnection conn = new SqlConnection(_connectionString);
//            string query = "UPDATE ReturnRequest SET Status = @Status WHERE ReturnID = @ReturnID";
//            using SqlCommand cmd = new SqlCommand(query, conn);
//            cmd.Parameters.AddWithValue("@Status", newStatus);
//            cmd.Parameters.AddWithValue("@ReturnID", returnId);
//            await conn.OpenAsync();
//            return await cmd.ExecuteNonQueryAsync() > 0;
//        }
//    }
//}
using System.Data.SqlClient;
using WebApplication1.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http.HttpResults;

namespace WebApplication1.DataAccess
{
    public class DAReturnRequest
    {
        private readonly string _connectionString;

        public DAReturnRequest(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        // Submit return request without ProductID
        public async Task<bool> SubmitReturnAsync(ReturnRequestModel dto)
        {
            try
            {
                using SqlConnection conn = new SqlConnection(_connectionString);
                await conn.OpenAsync();

                // Step 1: Get ProductID from OrderItem based on OrderID
                string getProductIdQuery = "SELECT TOP 1 ProductID FROM OrderItem WHERE OrderID = @OrderID";
                using SqlCommand getProductCmd = new SqlCommand(getProductIdQuery, conn);
                getProductCmd.Parameters.AddWithValue("@OrderID", dto.OrderID);

                object result = await getProductCmd.ExecuteScalarAsync();
                if (result == null)
                    throw new Exception($"No product found for OrderID {dto.OrderID}");

                int productId = Convert.ToInt32(result);

                // Step 2: Insert into ReturnRequest with the fetched ProductID
                string insertQuery = @"INSERT INTO ReturnRequest 
(OrderID, ProductID, FullName, Email, PhoneNumber, Reason, ProductCondition, Comment, ImageUrl, Status) 
VALUES 
(@OrderID, @ProductID, @FullName, @Email, @PhoneNumber, @Reason, @ProductCondition, @Comment, @ImageUrl, @Status)";

                using SqlCommand insertCmd = new SqlCommand(insertQuery, conn);

                insertCmd.Parameters.AddWithValue("@OrderID", dto.OrderID);
                insertCmd.Parameters.AddWithValue("@ProductID", productId);
                insertCmd.Parameters.AddWithValue("@FullName", dto.FullName);
                insertCmd.Parameters.AddWithValue("@Email", dto.Email);
                insertCmd.Parameters.AddWithValue("@PhoneNumber", dto.PhoneNumber);
                insertCmd.Parameters.AddWithValue("@Reason", dto.Reason);
                insertCmd.Parameters.AddWithValue("@ProductCondition", dto.ProductCondition);
                insertCmd.Parameters.AddWithValue("@Comment", dto.Comment ?? (object)DBNull.Value);
                insertCmd.Parameters.AddWithValue("@ImageUrl", dto.ImageUrl ?? (object)DBNull.Value);
                insertCmd.Parameters.AddWithValue("@Status", dto.Status ?? "Pending");

                return await insertCmd.ExecuteNonQueryAsync() > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in SubmitReturnAsync: " + ex.Message);
                throw;
            }
        }

        // Get all return requests
        public async Task<List<ReturnRequestModel>> GetAllReturnsAsync()
        {
            var list = new List<ReturnRequestModel>();
            using SqlConnection conn = new SqlConnection(_connectionString);
            string query = "SELECT * FROM ReturnRequest ORDER BY CreatedAt DESC";
            using SqlCommand cmd = new SqlCommand(query, conn);
            await conn.OpenAsync();
            using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                list.Add(MapReturnRequest(reader));
            }

            return list;
        }

        // Get return requests by OrderID
        public async Task<List<ReturnRequestModel>> GetReturnsByOrderIdAsync(int orderId)
        {
            var list = new List<ReturnRequestModel>();
            using SqlConnection conn = new SqlConnection(_connectionString);
            string query = "SELECT * FROM ReturnRequest WHERE OrderID = @OrderID ORDER BY CreatedAt DESC";
            using SqlCommand cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@OrderID", orderId);
            await conn.OpenAsync();

            using SqlDataReader reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(MapReturnRequest(reader));
            }

            return list;
        }

        // Get single return request by ReturnID
        public async Task<ReturnRequestModel?> GetReturnByIdAsync(int returnId)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            string sql = "SELECT * FROM ReturnRequest WHERE ReturnID = @ReturnID";
            using SqlCommand cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@ReturnID", returnId);

            await conn.OpenAsync();
            using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return MapReturnRequest(reader);
            }
            return null;
        }

        // Update return status
        public async Task<bool> UpdateReturnStatusAsync(int returnId, string newStatus)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            string query = "UPDATE ReturnRequest SET Status = @Status WHERE ReturnID = @ReturnID";
            using SqlCommand cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@Status", newStatus);
            cmd.Parameters.AddWithValue("@ReturnID", returnId);
            await conn.OpenAsync();
            return await cmd.ExecuteNonQueryAsync() > 0;
        }

        //// New: Get products by OrderID (needed for your controller)
        //public async Task<List<ProductDto>> GetProductsByOrderIdAsync(int orderId)
        //{
        //    var products = new List<ProductDto>();

        //    var sql = @"
        //        SELECT p.ProductID, p.Name, p.Price, p.Stock, p.Description
        //        FROM OrderItem oi
        //        JOIN Product p ON oi.ProductID = p.ProductID
        //        WHERE oi.OrderID = @OrderID";

        //    using var conn = new SqlConnection(_connectionString);
        //    using var cmd = new SqlCommand(sql, conn);
        //    cmd.Parameters.AddWithValue("@OrderID", orderId);

        //    await conn.OpenAsync();
        //    using var reader = await cmd.ExecuteReaderAsync();

        //    while (await reader.ReadAsync())
        //    {
        //        products.Add(new ProductDto
        //        {
        //            ProductID = reader.GetInt32(reader.GetOrdinal("ProductID")),
        //            Name = reader.GetString(reader.GetOrdinal("Name")),
        //            Price = reader.GetDecimal(reader.GetOrdinal("Price")),
        //            Stock = reader.GetInt32(reader.GetOrdinal("Stock")),
        //            Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description"))
        //        });
        //    }

        //    return products;
        //}
        public async Task<List<ProductDto>> GetProductsByOrderIdAsync(int orderId)
        {
            var products = new List<ProductDto>();

            var sql = @"
        SELECT p.ProductID, p.Name, p.Price, p.Stock, p.Description
        FROM OrderItem oi
        JOIN Product p ON oi.ProductID = p.ProductID
        WHERE oi.OrderID = @OrderID";

            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@OrderID", orderId);

            await conn.OpenAsync();
            using var reader = await cmd.ExecuteReaderAsync();

            var productList = new List<ProductDto>();

            while (await reader.ReadAsync())
            {
                var product = new ProductDto
                {
                    ProductID = reader.GetInt32(reader.GetOrdinal("ProductID")),
                    Name = reader.GetString(reader.GetOrdinal("Name")),
                    Price = reader.GetDecimal(reader.GetOrdinal("Price")),
                    Stock = reader.GetInt32(reader.GetOrdinal("Stock")),
                    Description = reader.IsDBNull(reader.GetOrdinal("Description"))
                        ? null
                        : reader.GetString(reader.GetOrdinal("Description"))
                };

                productList.Add(product);
            }

            await reader.CloseAsync();

            // Load images for each product
            foreach (var product in productList)
            {
                var imageCmd = new SqlCommand(@"
            SELECT ImageData 
            FROM ProductImage 
            WHERE ProductID = @ProductID", conn);

                imageCmd.Parameters.AddWithValue("@ProductID", product.ProductID);

                using var imageReader = await imageCmd.ExecuteReaderAsync();

                var imageUrls = new List<string>();

                while (await imageReader.ReadAsync())
                {
                    if (!imageReader.IsDBNull(0))
                    {
                        byte[] imageData = (byte[])imageReader["ImageData"];
                        string base64 = $"data:image/png;base64,{Convert.ToBase64String(imageData)}";
                        imageUrls.Add(base64);
                    }
                }

                await imageReader.CloseAsync();

                product.ImageUrls = imageUrls;

                products.Add(product);
            }

            return products;
        }



        // Helper method to map ReturnRequestModel from SqlDataReader
        private ReturnRequestModel MapReturnRequest(SqlDataReader reader)
        {
            return new ReturnRequestModel
            {
                ReturnID = reader.GetInt32(reader.GetOrdinal("ReturnID")),
                OrderID = reader.GetInt32(reader.GetOrdinal("OrderID")),
                FullName = reader.GetString(reader.GetOrdinal("FullName")),
                Email = reader.GetString(reader.GetOrdinal("Email")),
                PhoneNumber = reader.GetString(reader.GetOrdinal("PhoneNumber")),
                Reason = reader.GetString(reader.GetOrdinal("Reason")),
                ProductCondition = reader.GetString(reader.GetOrdinal("ProductCondition")),
                Comment = reader["Comment"] as string,
                ImageUrl = reader["ImageUrl"] as string,
                Status = reader.GetString(reader.GetOrdinal("Status")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")
)
            };
        }
    }
}
