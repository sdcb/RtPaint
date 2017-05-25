using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RtPaint.Dtos
{
    public class PaintDto
    {
        public int Id { get; set; }

        public List<BrushDto> Brushes { get; set; }
    }
}
