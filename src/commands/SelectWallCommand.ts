import type { ICommand } from "./ICommand";
import type { Document2D } from "../documents/Document2D";

import { Vector2, Vector3, Raycaster } from "three";

export class SelectWallCommand implements ICommand {
  private doc: Document2D;
  private raycaster: Raycaster = new Raycaster();
  private selectedWall: any = null;

  constructor(doc: Document2D) {
    this.doc = doc;
  }

  onMouseDown(e: MouseEvent): void {
    const rect = this.doc.getBoundingClientRect();
    const mouse = new Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    this.raycaster.setFromCamera(mouse, this.doc["camera"]);
    const intersects = this.raycaster.intersectObjects(
      this.doc["scene"].children.filter(obj => obj.type === "Mesh")
    );

    if (intersects.length > 0) {
      if (this.selectedWall) {
        this.selectedWall.material.color.set(0x6699ff);
      }
      
      this.selectedWall = intersects[0].object;
      this.selectedWall.material.color.set(0xff9900);
      document.getElementById("wallLength")!.textContent = 
        this.selectedWall.geometry.parameters.width.toFixed(2);
    }
  }

  onMouseUp(e: MouseEvent): void {
    // Optional: Add confirmation logic here
  }

  onMouseMove(e: MouseEvent): void {
    // Optional: Add hover effects here
  }

  execute(): void {
    // Command pattern entry point
    // Can be used for programmatic selection
  }
}