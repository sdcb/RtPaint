using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RtPaint.Dtos
{
    public class BrushDto
    {
        public float Size { get; set; }

        public string Color { get; set; }

        public List<float> Path { get; set; }

        public PaintDetails ToDbModel(int paintId)
        {
            return new PaintDetails
            {
                Color = Color,
                PaintId = paintId,
                PathText = string.Join(",", Path),
                Size = Size,
            };
        }
    }

    public class PaintDetails
    {
        public long Id { get; set; }

        public int PaintId { get; set; }

        public bool IsForward { get; set; }

        public float Size { get; set; }

        public string Color { get; set; }

        public string PathText { get; set; }

        public DateTime CreateTime { get; set; }

        public BrushDto ToDto()
        {
            return new BrushDto
            {
                Color = Color, 
                Path = PathText.Split(',').Select(float.Parse).ToList(), 
                Size = Size
            };
        }
    }
}
