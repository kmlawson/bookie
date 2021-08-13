import camelcaseKeys from 'camelcase-keys';
import { SourceCode } from 'eslint';
interface Source {
  title: string;
  author: {
    family: string;
    given: string;
    droppingParticle: string;
  }[];
  issued: {
    dateParts: (string | number)[][];
  };
  URL: string;
  tags: {
    tag: string;
    type: string | null;
  }[];
}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */ //  Class is only used externally
export class Bookie {
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
        source.tags.forEach((tag) => {
          if (tag.type === undefined) {
            tagSet.add(tag.tag);
          }
        });
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
      (source) =>
        source.tags?.find((t) => t.type === undefined && t.tag === tag) !==
        undefined,
    );

    taggedSources.forEach((source) => {
      const item = document.createElement('li');
      console.log(source);
      if (source.author) {
        const authorData = source.author.find((a) => a.family);
        if (authorData) {
          const author = document.createElement('span');
          author.textContent =
            (authorData.droppingParticle
              ? authorData.droppingParticle + ' '
              : '') +
            authorData.family +
            (authorData.given ? ', ' + authorData.given : '') +
            '. ';
          item.appendChild(author);
        }
      }

      const title = document.createElement('span');
      const titleLink = document.createElement('a') as HTMLAnchorElement;
      titleLink.href = source.URL;
      titleLink.innerText = source.title;
      title.appendChild(titleLink);
      item.appendChild(title);
      item.className = 'bookie__result__item';

      if (source.issued?.dateParts) {
        const issued = document.createElement('span');
        issued.textContent = ' (' + source.issued.dateParts[0][0] + ')';
        item.appendChild(issued);
      }

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
      .then((json) => camelcaseKeys(json, { deep: true }))
      .then((data) => data as TResponse);
  }
}
