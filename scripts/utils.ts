import {Disposable} from "event-kit";

/**
 * Keyed dispoable collection
 */
export class DisposableCollection extends Disposable implements AtomCore.Disposable {

  private disposables: { [key: string]: AtomCore.Disposable };

  constructor() {
    super(() => this.clear());
    this.disposables = {};
  }

  /**
   * Add a disposable to this collection
   *
   * If the key already exists, dispose and delete the previous disposable
   */
  public add(key: string, disposable: AtomCore.Disposable) {
    this.del(key);
    this.disposables[key] = disposable;
  }

  /**
   * Remove a disposable from this collection
   */
  public del(key: string) {
    if (this.disposables[key]) {
      this.disposables[key].dispose();
      delete this.disposables[key];
    }
  }

  /**
   * Dispose every disposables in this collection and delete them
   */
  public clear() {
    for (var key in this.disposables) {
      this.disposables[key].dispose();
      delete this.disposables[key];
    }
  }
}