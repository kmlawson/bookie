interface Source {
  tags: string[];
  title: string;
}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */  //  Class is only used externally
class Bookie {
  sources: Source[] | null = null;
  tagElement: HTMLElement | null = null;
  resultsElement: HTMLElement | null = null;

  async init(elementId: string, filepath: string) {
    const elem = document.getElementById(elementId);
    if (elem === null) {
      return;
    }
    this.sources = await this.request<Source[]>(filepath);

    elem.innerHTML = '';
    elem.className = 'dsf';
    this.tagElement = document.createElement('div');
    this.tagElement.className = 'bookie__tags';
    elem.appendChild(this.tagElement);
    this.resultsElement = document.createElement('div');
    this.resultsElement.className = 'bookie__result';
    elem.appendChild(this.resultsElement);

    const tagSet = new Set<string>();
    this.sources.forEach((source) => {
      if (source.tags != null) {
        source.tags.forEach((tag) => tagSet.add(tag));
      }
    });

    tagSet.forEach((tag) => {
      if (this.tagElement === null) return;
      const button = document.createElement('button');
      button.textContent = tag;
      button.className = 'bookie__tag';
      button.onclick = () => {
        this.show(tag);
      };
      this.tagElement.appendChild(button);
    });
  }

  private show(tag: string) {
    if (this.resultsElement === null) return;
    if (this.sources === null) return;

    this.resultsElement.innerHTML = '';
    const list = document.createElement('ul');
    list.className = 'bookie__result__list';

    this.resultsElement.appendChild(list);

    const taggedSources = this.sources.filter(
      (source) => source.tags?.indexOf(tag) != -1,
    );

    taggedSources.forEach((source) => {
      const item = document.createElement('li');
      item.textContent = source.title;
      item.className = 'bookie__result__item';

      list.appendChild(item);
    });
  }

  private async request<TResponse>(
    url: string,
    // `RequestInit` is a type for configuring
    // a `fetch` request. By default, an empty object.
    config: RequestInit = {},
  ): Promise<TResponse> {
    return fetch(url, config)
      .then((response) => response.json())
      .then((data) => data as TResponse);
  }
}
