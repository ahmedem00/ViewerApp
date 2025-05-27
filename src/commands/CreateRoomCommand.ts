import type { Document2D } from "../documents/Document2D";
import type { ICommand } from "../commands/ICommand";
import { Vector3, Mesh, PlaneGeometry, MeshBasicMaterial, Vector2 } from "three";

export class CreateRoomCommand implements ICommand {
  private doc: Document2D;
  private startPoint: Vector3 | null = null;
  private previewWalls: Mesh[] = [];
   mouse:Vector2=new Vector2();

  constructor(doc: Document2D) {
    this.doc = doc;
  }

  onMouseDown(e: MouseEvent): void {
    const rect = this.doc.getBoundingClientRect();
    const mouse = new Vector3(
      (e.clientX - rect.left) / rect.width * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
      0.5
    );
    
    this.startPoint = mouse.unproject(this.doc["camera"]).clone();
    this.startPoint.z = 0; // Ensure Z is zero for 2D plane
  }

  onMouseMove(e: MouseEvent): void {
    if (!this.startPoint) return;
    

    // Clear previous preview
    this.previewWalls.forEach(wall => this.doc.removeObject(wall));
    this.previewWalls = [];

    const rect = this.doc.getBoundingClientRect();
    const mouse = new Vector3(
        (e.clientX - rect.left) / rect.width * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
        0.5
    );
    
    // const endPoint = mouse.unproject(this.doc["camera"]).clone();
    const endPoint = new Vector3(
      e.clientX - rect.left - rect.width/2,
      rect.height/2 - (e.clientY - rect.top),
      0
    );

    // Create preview walls
    const walls = this.calculateRoomWalls(this.startPoint, endPoint);
    walls.forEach(wall => {
      const geometry = new PlaneGeometry(wall.length, 1);
      const material = new MeshBasicMaterial({
        color: 0x6699ff,
        transparent: true,
        opacity: 0.4
      });
      const mesh = new Mesh(geometry, material);
      mesh.position.copy(wall.center);
      mesh.rotation.z = wall.angle;
      this.previewWalls.push(mesh);
      this.doc.addObject(mesh);
    });
  }

 onMouseUp(e: MouseEvent): void {
    if (!this.startPoint) return;

    const rect = this.doc.getBoundingClientRect();
    const mouse = new Vector3(
      (e.clientX - rect.left) / rect.width * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
      0.5
    );
    
    const endPoint = mouse.unproject(this.doc["camera"]).clone();
    endPoint.z = 0;

    // Create final walls
    const walls = this.calculateRoomWalls(this.startPoint, endPoint);
    walls.forEach(wall => {
      this.doc.drawWall(
        new Vector3(wall.start.x, wall.start.y, 0),
        new Vector3(wall.end.x, wall.end.y, 0)
      );
    });

    // Cleanup
    this.previewWalls.forEach(wall => this.doc.removeObject(wall));
    this.previewWalls = [];
    this.startPoint = null;
  }



  private calculateRoomWalls(start: Vector3, end: Vector3) {
    return [
        { // Top wall
            start: new Vector3(start.x, start.y, 0),
            end: new Vector3(end.x, start.y, 0),
            center: new Vector3((start.x + end.x)/2, start.y, 0),
            length: Math.abs(end.x - start.x),
            angle: 0
        },
        { // Right wall
            start: new Vector3(end.x, start.y, 0),
            end: new Vector3(end.x, end.y, 0),
            center: new Vector3(end.x, (start.y + end.y)/2, 0),
            length: Math.abs(end.y - start.y),
            angle: Math.PI/2
        },
        { // Bottom wall
            start: new Vector3(end.x, end.y, 0),
            end: new Vector3(start.x, end.y, 0),
            center: new Vector3((start.x + end.x)/2, end.y, 0),
            length: Math.abs(end.x - start.x),
            angle: 0
        },
        { // Left wall
            start: new Vector3(start.x, end.y, 0),
            end: new Vector3(start.x, start.y, 0),
            center: new Vector3(start.x, (start.y + end.y)/2, 0),
            length: Math.abs(end.y - start.y),
            angle: Math.PI/2
        }
    ];
}
  execute(): void {}
}