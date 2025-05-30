import { v4 as uuidv4 } from 'uuid';
import { StoryElement } from './StoryGenerator';

export interface LevelLayout {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  grid: GridCell[][];
  points_of_interest: PointOfInterest[];
  connections: Connection[];
}

interface GridCell {
  x: number;
  y: number;
  type: 'walkable' | 'obstacle' | 'point_of_interest' | 'transition';
  properties: Record<string, any>;
}

export interface PointOfInterest {
  id: string;
  name: string;
  type: 'quest' | 'shop' | 'story' | 'challenge';
  position: { x: number; y: number };
  storyElements: StoryElement[];
  requirements: string[];
}

interface Connection {
  id: string;
  from: string; // PointOfInterest id
  to: string; // PointOfInterest id
  type: 'path' | 'door' | 'portal';
  properties: Record<string, any>;
}

export class LevelDesigner {
  private layout: LevelLayout;

  constructor(width: number, height: number, name: string = '', description: string = '') {
    this.layout = this.initializeLayout(width, height, name, description);
  }

  private initializeLayout(width: number, height: number, name: string, description: string): LevelLayout {
    const grid: GridCell[][] = Array(height).fill(null).map((_, y) =>
      Array(width).fill(null).map((_, x) => ({
        x,
        y,
        type: 'walkable',
        properties: {}
      }))
    );

    return {
      id: uuidv4(),
      name,
      description,
      width,
      height,
      grid,
      points_of_interest: [],
      connections: []
    };
  }

  public addPointOfInterest(
    name: string,
    type: PointOfInterest['type'],
    position: { x: number; y: number },
    storyElements: StoryElement[] = [],
    requirements: string[] = []
  ): PointOfInterest {
    const poi: PointOfInterest = {
      id: uuidv4(),
      name,
      type,
      position,
      storyElements,
      requirements
    };

    // Update grid cell type
    if (this.isValidPosition(position)) {
      this.layout.grid[position.y][position.x].type = 'point_of_interest';
    }

    this.layout.points_of_interest.push(poi);
    return poi;
  }

  public addConnection(
    fromId: string,
    toId: string,
    type: Connection['type'] = 'path',
    properties: Record<string, any> = {}
  ): Connection {
    const connection: Connection = {
      id: uuidv4(),
      from: fromId,
      to: toId,
      type,
      properties
    };
    this.layout.connections.push(connection);
    return connection;
  }

  public setObstacle(x: number, y: number, properties: Record<string, any> = {}): void {
    if (this.isValidPosition({ x, y })) {
      this.layout.grid[y][x] = {
        x,
        y,
        type: 'obstacle',
        properties
      };
    }
  }

  public setTransition(x: number, y: number, properties: Record<string, any> = {}): void {
    if (this.isValidPosition({ x, y })) {
      this.layout.grid[y][x] = {
        x,
        y,
        type: 'transition',
        properties
      };
    }
  }

  private isValidPosition(position: { x: number; y: number }): boolean {
    return (
      position.x >= 0 &&
      position.x < this.layout.width &&
      position.y >= 0 &&
      position.y < this.layout.height
    );
  }

  public getLayout(): LevelLayout {
    return this.layout;
  }

  public validateLayout(): boolean {
    // Implement layout validation logic
    // Check for unreachable areas, invalid connections, etc.
    return true;
  }

  public generateLayoutVariations(count: number): LevelLayout[] {
    // Implement logic to generate variations of the current layout
    return [this.layout];
  }
} 