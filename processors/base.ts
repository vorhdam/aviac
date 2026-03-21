import { AviacError } from "../helpers/errors";
import { mimeToExtension } from "../helpers/mimes";

export abstract class BaseProcessor<T extends BaseProcessor<T>> {
  protected readonly file: File;

  constructor(file: File) {
    if (!(file instanceof File)) {
      throw new AviacError(
        `The processor expects a File. Recieved: ${typeof file}`,
      );
    }
    this.file = file;
  }

  protected get getName(): string {
    const name = this.file.name;
    const dot = name.lastIndexOf(".");
    return dot !== -1 ? name.slice(0, dot) : name;
  }

  protected createName(mime: string): string {
    const extension = mimeToExtension(mime) ?? "bin";
    return `${this.getName}.${extension}`;
  }

  /**
   * Executes the file process, then returns the result.
   */
  abstract execute(): Promise<File>;
}
