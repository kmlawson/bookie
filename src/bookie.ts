import camelcaseKeys from 'camelcase-keys';

interface Source {
  title: string;
  author: {
    family: string;
    given: string;
    droppingParticle: string;
    literal: string;
  }[];
  issued: {
    dateParts: (string | number)[][];
  };
  url: string;
  tags: {
    tag: string;
    type: string | null;
  }[];
}

class Book {
  private source: Source;
  private typelessTags: string[];
  private authorList: string[];
  constructor(source: Source) {
    this.source = source;
    this.typelessTags = source.tags.filter((t) => !t.type).map((t) => t.tag);
    if (source.author) {
      this.authorList = source.author.map((a) => {
        if (!a) return '';
        if (a.literal) return a.literal;
        return (
          (a.droppingParticle ? a.droppingParticle + ' ' : '') +
          a.family +
          (a.given ? ', ' + a.given : '')
        );
      });
    } else {
      this.authorList = [''];
    }
  }

  get title(): string {
    return this.source.title;
  }
  get issued(): string {
    if (this.source.issued?.dateParts) {
      return '(' + this.source.issued.dateParts[0][0] + ')';
    }
    return '';
  }
  get tags(): string[] {
    return this.typelessTags;
  }
  get authors(): string[] {
    return this.authorList;
  }
  get url(): string {
    return this.source.url;
  }
}

export class Bookie {
  sources: Book[] | null = null;
  tagElement: HTMLElement | null = null;
  resultsElement: HTMLElement | null = null;

  init(elementId: string, filepath: string): void {
    const elem = document.getElementById(elementId);
    if (elem === null) {
      return;
    }
    this.request<Source[]>(filepath).then((sources: Source[]) => {
      if (!sources) return;
      this.sources = sources
        .map((s) => new Book(s))
        .sort((a, b) =>
          a.authors[0]
            .toUpperCase()
            .localeCompare(b.authors[0].toUpperCase()) !== 0
            ? a.authors[0]
                .toUpperCase()
                .localeCompare(b.authors[0].toUpperCase())
            : a.title.toUpperCase().localeCompare(b.title.toUpperCase()),
        );
      const firstBookWithAuthor = this.sources.find((b) => b.authors[0] !== '');
      if (firstBookWithAuthor !== undefined) {
        const indexOfFirstBookWithAuthors =
          this.sources.indexOf(firstBookWithAuthor);
        const noAuthors = this.sources.slice(0, indexOfFirstBookWithAuthors);
        const hasAuthors = this.sources.slice(
          indexOfFirstBookWithAuthors,
          this.sources.length,
        );
        this.sources = [...hasAuthors, ...noAuthors];
      }

      elem.innerHTML = '';
      elem.className = '';

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
            tagSet.add(tag);
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
    });
  }

  private show(tag: string) {
    if (this.resultsElement === null) return;
    if (this.sources === null) return;

    this.resultsElement.innerHTML = '';
    const list = document.createElement('ul');
    list.className = 'bookie__result__list';

    this.resultsElement.appendChild(list);

    const taggedSources = this.sources.filter((source) =>
      source.tags?.find((t) => t === tag),
    );

    taggedSources.forEach((source) => {
      const item = document.createElement('li');
      item.className = 'bookie__result__item';

      this.appendAuthors(source, item);
      this.appendTitle(source, item);
      this.appendIssued(source, item);
      this.appendTags(source, item);

      list.appendChild(item);
    });
  }

  private appendTags(source: Book, item: HTMLLIElement) {
    const tags = document.createElement('div');
    tags.className = 'bookie__result__item__tags';
    source.tags.forEach((t) => {
      const tag = document.createElement('span');
      tag.textContent = t;
      tags.appendChild(tag);
    });
    item.appendChild(tags);
  }

  private appendIssued(source: Book, item: HTMLLIElement) {
    const issued = document.createElement('span');
    issued.textContent = ' ' + source.issued;
    item.appendChild(issued);
  }

  private appendTitle(source: Book, item: HTMLLIElement) {
    const title = document.createElement('span');
    title.className = 'bookie__result__item__title';
    if (source.url) {
      const titleLink = document.createElement<'a'>('a');
      titleLink.href = source.url;
      titleLink.innerText = source.title;
      title.appendChild(titleLink);
    } else {
      title.textContent = source.title;
    }
    item.appendChild(title);
  }

  private appendAuthors(source: Book, item: HTMLLIElement) {
    const author = document.createElement('span');
    author.className = 'bookie__result__item__authors';
    author.innerHTML = source.authors
      .map((a) => '<div>' + a + '</div>')
      .join('');
    item.appendChild(author);
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
