declare namespace RtPaint {
    export interface PaintDto {
        id: number;
        brushes: BrushDto[];
        forwardBrushes: BrushDto[];
    }

    export interface BrushDto {
        size: number;
        color: string;
        path: number[];
    }

    export interface Point {
        x: number; 
        y: number;
    }
}
