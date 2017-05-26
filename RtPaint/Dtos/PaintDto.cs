using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RtPaint.Dtos
{
    public class PaintDto
    {
        public int Id { get; set; }

        public IEnumerable<BrushDto> Brushes { get; set; }

        public IEnumerable<BrushDto> ForwardBrushes { get; set; }
    }
}
