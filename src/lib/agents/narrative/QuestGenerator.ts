import { v4 as uuidv4 } from 'uuid';
import { StoryElement } from './StoryGenerator';
import { PointOfInterest, LevelLayout } from './LevelDesigner';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  difficulty: number;
  requirements: QuestRequirement[];
  objectives: QuestObjective[];
  rewards: QuestReward[];
  state: QuestState;
  linkedStoryElements: StoryElement[];
}

type QuestType = 'main' | 'side' | 'hidden' | 'repeatable';
type QuestState = 'available' | 'active' | 'completed' | 'failed' | 'locked';

interface QuestRequirement {
  id: string;
  type: 'level' | 'item' | 'quest' | 'reputation' | 'skill';
  target: string;
  value: number;
}

interface QuestObjective {
  id: string;
  description: string;
  type: 'collect' | 'kill' | 'interact' | 'reach' | 'escort' | 'defend';
  target: string;
  amount: number;
  location?: PointOfInterest;
  completed: boolean;
  optional: boolean;
}

interface QuestReward {
  id: string;
  type: 'experience' | 'item' | 'currency' | 'reputation' | 'skill';
  item: string;
  amount: number;
}

export class QuestGenerator {
  private quests: Quest[];
  private levelLayout: LevelLayout | null;

  constructor() {
    this.quests = [];
    this.levelLayout = null;
  }

  public setLevelLayout(layout: LevelLayout): void {
    this.levelLayout = layout;
  }

  public createQuest(
    title: string,
    description: string,
    type: QuestType,
    difficulty: number,
    linkedStoryElements: StoryElement[] = []
  ): Quest {
    const quest: Quest = {
      id: uuidv4(),
      title,
      description,
      type,
      difficulty,
      requirements: [],
      objectives: [],
      rewards: [],
      state: 'locked',
      linkedStoryElements
    };

    this.quests.push(quest);
    return quest;
  }

  public addQuestRequirement(
    questId: string,
    type: QuestRequirement['type'],
    target: string,
    value: number
  ): QuestRequirement | null {
    const quest = this.findQuest(questId);
    if (!quest) return null;

    const requirement: QuestRequirement = {
      id: uuidv4(),
      type,
      target,
      value
    };

    quest.requirements.push(requirement);
    return requirement;
  }

  public addQuestObjective(
    questId: string,
    description: string,
    type: QuestObjective['type'],
    target: string,
    amount: number,
    location?: PointOfInterest,
    optional: boolean = false
  ): QuestObjective | null {
    const quest = this.findQuest(questId);
    if (!quest) return null;

    const objective: QuestObjective = {
      id: uuidv4(),
      description,
      type,
      target,
      amount,
      location,
      completed: false,
      optional
    };

    quest.objectives.push(objective);
    return objective;
  }

  public addQuestReward(
    questId: string,
    type: QuestReward['type'],
    item: string,
    amount: number
  ): QuestReward | null {
    const quest = this.findQuest(questId);
    if (!quest) return null;

    const reward: QuestReward = {
      id: uuidv4(),
      type,
      item,
      amount
    };

    quest.rewards.push(reward);
    return reward;
  }

  public updateQuestState(questId: string, state: QuestState): boolean {
    const quest = this.findQuest(questId);
    if (!quest) return false;

    quest.state = state;
    return true;
  }

  public completeQuestObjective(questId: string, objectiveId: string): boolean {
    const quest = this.findQuest(questId);
    if (!quest) return false;

    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective) return false;

    objective.completed = true;
    
    // Check if all required objectives are completed
    const allRequiredCompleted = quest.objectives
      .filter(obj => !obj.optional)
      .every(obj => obj.completed);

    if (allRequiredCompleted) {
      quest.state = 'completed';
    }

    return true;
  }

  private findQuest(questId: string): Quest | null {
    return this.quests.find(quest => quest.id === questId) || null;
  }

  public getAvailableQuests(): Quest[] {
    return this.quests.filter(quest => quest.state === 'available');
  }

  public getQuestsByType(type: QuestType): Quest[] {
    return this.quests.filter(quest => quest.type === type);
  }

  public generateQuestChain(
    mainQuest: Quest,
    numberOfSubquests: number,
    difficulty: number
  ): Quest[] {
    // Implement quest chain generation logic
    return [mainQuest];
  }

  public validateQuest(quest: Quest): boolean {
    // Implement quest validation logic
    // Check for valid requirements, objectives, and rewards
    return true;
  }
} 