import {FileConfig} from './file-config';
import {TestInfo} from './test-info';

export interface SlideConfig {
  name: string,
  description: string
}

export interface ExerciseConfig {
  name: string,
  description: string,
  files: Array<FileConfig>,
  skipTests?: boolean,
  tests?: Array<TestInfo>
}


