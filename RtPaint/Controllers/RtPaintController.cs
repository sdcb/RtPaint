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

        public int Post()
        {
            return _connection.ExecuteScalarById<int>("RtPaint.Create");
        }

        [Route("{paintId}")]
        public PaintDto Get(int paintId)
        {
            var brushLists = _connection
                .QueryById<PaintDetails>("RtPaint.GetBrush", new { PaintId = paintId }, null, false)
                .Select(x => x.ToDto())
                .ToList();
            return new PaintDto
            {
                Id = paintId, 
                Brushes = brushLists
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
        }

        [Route("{paintId}/Forward")]
        public void Forward(int paintId)
        {
            var affectedRows = _connection.ExecuteById("RtPaint.ForwardBrush", new { PaintId = paintId });
        }

        [Route("{paintId}/DeleteBrush/{brushId}")]
        public void DeleteBrush(int paintId, int brushId)
        {
            var affectedRows = _connection.ExecuteById("RtPaint.DeleteBrush", new
            {
                PaintId = paintId,
                Id = brushId
            });
            Contract.Assert(affectedRows == 1);
        }
    }
}
