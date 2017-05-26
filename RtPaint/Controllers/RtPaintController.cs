using Dapper;
using Microsoft.AspNetCore.Mvc;
using RtPaint.Dtos;
using RtPaint.Infrastructure;
using sdmap.Extensions;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RtPaint.Controllers
{
    [Route("api/[controller]")]
    public class RtPaintController : Controller
    {
        private readonly SqlConnection _connection;

        public RtPaintController(SqlConnection connection)
        {
            _connection = connection;
        }

        private string GetRequestIP()
        {
            var forwarded = Request.Headers["X-Forwarded-For"];
            if (forwarded.Any())
            {
                return forwarded.ToString();
            }
            else
            {
                return HttpContext.Connection.RemoteIpAddress.ToString();
            }
        }

        public int Post(float size, string color)
        {
            return _connection.ExecuteScalarById<int>("RtPaint.Create", new
            {
                Size = size, 
                Color = color, 
                CreateIP = GetRequestIP()
            });
        }

        [Route("{paintId}")]
        public PaintDto Get(int paintId)
        {
            var brushLists = _connection
                .QueryById<PaintDetails>("RtPaint.GetBrush", new { PaintId = paintId })
                .AsList();
            return new PaintDto
            {
                Id = paintId, 
                Brushes = brushLists
                    .Where(x => !x.IsForward).Select(x => x.ToDto()), 
                ForwardBrushes = brushLists
                    .Where(x => x.IsForward).Select(x => x.ToDto())
            };
        }
        
        [Route("{paintId}/CreateBrush")]
        public long CreateBrush(int paintId, [FromBody] BrushDto pen)
        {
            var db = pen.ToDbModel(paintId);
            return _connection.ExecuteScalarById<long>("RtPaint.CreateBrush", db);
        }

        [Route("{paintId}/Back")]
        public void Back(int paintId)
        {
            var affectedRows = _connection.ExecuteById("RtPaint.BackBrush", new { PaintId = paintId });
            ValidateAffectedRows(affectedRows);
        }

        [Route("{paintId}/Forward")]
        public void Forward(int paintId)
        {
            var affectedRows = _connection.ExecuteById("RtPaint.ForwardBrush", new { PaintId = paintId });
            ValidateAffectedRows(affectedRows);
        }

        [Route("{paintId}/DeleteBrush/{brushId}")]
        public void DeleteBrush(int paintId, int brushId)
        {
            var affectedRows = _connection.ExecuteById("RtPaint.DeleteBrush", new
            {
                PaintId = paintId,
                Id = brushId
            });
            ValidateAffectedRows(affectedRows);
        }

        [Route("{paintId}/Clear")]
        public int Clear(int paintId)
        {
            return _connection.ExecuteById("RtPaint.Clear", new { PaintId = paintId });
        }

        private void ValidateAffectedRows(int affectedRows)
        {
            if (affectedRows != 1)
            {
                throw new Exception($"AffectedRows expected to 1 but get: {affectedRows}, this generally indicates a bug.");
            }
        }
    }
}
