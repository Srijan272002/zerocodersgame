import { v4 as uuidv4 } from 'uuid';

export interface StoryElement {
  id: string;
  type: 'character' | 'location' | 'event' | 'item';
  name: string;
  description: string;
  properties: Record<string, any>;
}

export interface StoryStructure {
  id: string;
  title: string;
  synopsis: string;
  elements: StoryElement[];
  plotPoints: PlotPoint[];
  timeline: Timeline;
}

interface PlotPoint {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  consequences: string[];
  order: number;
}

interface Timeline {
  events: TimelineEvent[];
  branches: TimelineBranch[];
}

interface TimelineEvent {
  id: string;
  plotPointId: string;
  timestamp: number;
  dependencies: string[];
}

interface TimelineBranch {
  id: string;
  condition: string;
  alternativeEvents: TimelineEvent[];
}

export class StoryGenerator {
  private story: StoryStructure;

  constructor() {
    this.story = this.initializeStory();
  }

  private initializeStory(): StoryStructure {
    return {
      id: uuidv4(),
      title: '',
      synopsis: '',
      elements: [],
      plotPoints: [],
      timeline: {
        events: [],
        branches: []
      }
    };
  }

  public setStoryBasics(title: string, synopsis: string): void {
    this.story.title = title;
    this.story.synopsis = synopsis;
  }

  public addStoryElement(type: StoryElement['type'], name: string, description: string, properties: Record<string, any> = {}): StoryElement {
    const element: StoryElement = {
      id: uuidv4(),
      type,
      name,
      description,
      properties
    };
    this.story.elements.push(element);
    return element;
  }

  public addPlotPoint(title: string, description: string, requirements: string[] = [], consequences: string[] = []): PlotPoint {
    const plotPoint: PlotPoint = {
      id: uuidv4(),
      title,
      description,
      requirements,
      consequences,
      order: this.story.plotPoints.length
    };
    this.story.plotPoints.push(plotPoint);
    return plotPoint;
  }

  public addTimelineEvent(plotPointId: string, timestamp: number, dependencies: string[] = []): TimelineEvent {
    const event: TimelineEvent = {
      id: uuidv4(),
      plotPointId,
      timestamp,
      dependencies
    };
    this.story.timeline.events.push(event);
    return event;
  }

  public addTimelineBranch(condition: string, alternativeEvents: TimelineEvent[]): TimelineBranch {
    const branch: TimelineBranch = {
      id: uuidv4(),
      condition,
      alternativeEvents
    };
    this.story.timeline.branches.push(branch);
    return branch;
  }

  public getStory(): StoryStructure {
    return this.story;
  }

  public validateStory(): boolean {
    // Implement story validation logic
    // Check for plot holes, inconsistencies, etc.
    return true;
  }

  public generateStoryVariations(count: number): StoryStructure[] {
    // Implement logic to generate variations of the current story
    return [this.story];
  }
} 