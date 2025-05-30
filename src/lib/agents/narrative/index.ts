export * from './StoryGenerator';
export * from './LevelDesigner';
export * from './QuestGenerator';

export class NarrativeGenerator {
  private storyGenerator: import('./StoryGenerator').StoryGenerator;
  private levelDesigner: import('./LevelDesigner').LevelDesigner;
  private questGenerator: import('./QuestGenerator').QuestGenerator;

  constructor() {
    this.storyGenerator = new (require('./StoryGenerator').StoryGenerator)();
    this.levelDesigner = new (require('./LevelDesigner').LevelDesigner)(100, 100);
    this.questGenerator = new (require('./QuestGenerator').QuestGenerator)();
  }

  public generateStoryDrivenLevel(
    title: string,
    description: string,
    difficulty: number
  ): void {
    // Create the base story
    this.storyGenerator.setStoryBasics(title, description);

    // Generate main story elements
    const protagonist = this.storyGenerator.addStoryElement('character', 'Protagonist', 'The main character');
    const antagonist = this.storyGenerator.addStoryElement('character', 'Antagonist', 'The main villain');
    const mainLocation = this.storyGenerator.addStoryElement('location', 'Main Hub', 'Central area of the level');

    // Create the level layout
    const layout = this.levelDesigner.getLayout();
    this.questGenerator.setLevelLayout(layout);

    // Generate the main quest
    const mainQuest = this.questGenerator.createQuest(
      'Main Quest',
      'The primary objective',
      'main',
      difficulty,
      [protagonist, antagonist]
    );

    // Add quest objectives
    this.questGenerator.addQuestObjective(
      mainQuest.id,
      'Find the antagonist',
      'reach',
      antagonist.id,
      1
    );

    // Generate side quests
    const sideQuests = this.questGenerator.generateQuestChain(mainQuest, 3, difficulty - 1);

    // Update quest states
    this.questGenerator.updateQuestState(mainQuest.id, 'available');
  }

  public getGeneratedStory() {
    return this.storyGenerator.getStory();
  }

  public getGeneratedLevel() {
    return this.levelDesigner.getLayout();
  }

  public getGeneratedQuests() {
    return this.questGenerator.getAvailableQuests();
  }
} 