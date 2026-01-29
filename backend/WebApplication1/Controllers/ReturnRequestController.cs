using Microsoft.AspNetCore.Mvc;
using WebApplication1.DataAccess;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReturnRequestController : ControllerBase
    {
        private readonly DAReturnRequest _dataAccess;

        public ReturnRequestController(IConfiguration configuration)
        {
            _dataAccess = new DAReturnRequest(configuration);
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitReturn([FromBody] ReturnRequestModel dto)
        {
            bool success = await _dataAccess.SubmitReturnAsync(dto);
            if (success)
                return Ok(new { message = "Return request submitted successfully." });
            return BadRequest(new { message = "Failed to submit return request." });
        }
        [HttpGet("by-order/{orderId}")]
        public async Task<IActionResult> GetReturnsByOrderId(int orderId)
        {
            var returns = await _dataAccess.GetReturnsByOrderIdAsync(orderId);
            return Ok(returns);
        }


        [HttpGet("all")]
        public async Task<IActionResult> GetAllReturns()
        {
            var returns = await _dataAccess.GetAllReturnsAsync();
            return Ok(returns);
        }
        [HttpGet("GetProductsByOrder")]
        public async Task<IActionResult> GetProductsByOrder(int orderId)
        {
            var products = await _dataAccess.GetProductsByOrderIdAsync(orderId);
            if (products == null || products.Count == 0)
                return NotFound(new { message = "No products found for this order." });

            return Ok(products);
        }
        [HttpPut("update-status/{returnId}")]
        public async Task<IActionResult> UpdateStatus(int returnId, [FromBody] string newStatus)
        {
            bool success = await _dataAccess.UpdateReturnStatusAsync(returnId, newStatus);
            if (success)
                return Ok(new { message = "Status updated successfully." });
            return BadRequest(new { message = "Failed to update status." });
        }
    }
}
