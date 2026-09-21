import wkx from "wkx"; 

export const convertDbLocation = (location: string | null): {lat: number, lng: number} | null => {
    let idealLocation: { lat: number; lng: number } | null = null;

    if (location) {
        const buffer = Buffer.from(location, "hex");
        const point = wkx.Geometry.parse(buffer) as wkx.Point;
        idealLocation = { lat: point.y, lng: point.x };
    }
    
    return idealLocation;
}