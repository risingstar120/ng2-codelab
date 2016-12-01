export interface FileConfig {
  collapsed?: boolean;
  /**
   * Only .ts is supported ATM.
   */
    type?: string;

  /**
   * Source code of the file.
   */
  code?: string;

  /**
   * Source code of the file.
   */
  solution?: string;

  /**
   * TS code to run before running the file.
   */
  before?: string;

  /**
   * TS code to run after running the file.
   */
  after?: string;

  /**
   * Usually the same as fileName without .ts postfix.
   * Currently gets inferred from filename.
   */
  moduleName?: string;

  /**
   * Actual filename.
   */
  filename: string;

  /**
   * If this is true; the file will be included in the preview iframe.
   */
  ui?: boolean;

  /**
   * If this is true
   */
  bootstrap?: boolean;

  /**
   * if this is true; the file will be displayed in read only mode.
   */
    readonly?: boolean;

  /**
   * If this is true the file will be included in the test iframe.
   */
  test?: boolean;

  /**
   * If this is true; the file will be hidden.
   */
  hidden?: boolean;

  /**
   * Sometimes we want to reuse files from different exercises.
   */
  path?: string;
}
