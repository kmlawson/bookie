interface Source {
  id: string;
  tags: string[];
  URL: string;
  title: string;
}

namespace bookie {
  var sources: Source[];
  var tagElement: HTMLElement;
  var resultsElement: HTMLElement;

  export async function init(elementId: string, filepath: string) {
    const elem = document.getElementById(elementId);
    let test;
    if (elem === null) {
      return;
    }
    elem.innerHTML = '';
    tagElement = document.createElement('div');
    elem.appendChild(tagElement);
    resultsElement = document.createElement('div');
    elem.appendChild(resultsElement);

    sources = await request<Source[]>(filepath);

    let tagSet = new Set<string>();
    sources.forEach((source) => {
      if (source.tags != null) {
        source.tags.forEach((tag) => tagSet.add(tag));
      }
    });

    tagSet.forEach((tag) => {
      let button = document.createElement('button');
      button.textContent = tag;
      button.className = 'bookie__tag';
      button.onclick = (ev) => {
        show(tag);
      };
      tagElement.appendChild(button);
    });
  }

  function show(tag: string) {
    resultsElement.innerHTML = '';
    const list = document.createElement('ul');
    list.className = 'bookie__result__list';

    resultsElement.appendChild(list);

    const taggedSources = sources.filter(
      (source) => source.tags?.indexOf(tag) != -1,
    );

    taggedSources.forEach((source) => {
      let item = document.createElement('li');
      item.textContent = source.title;
      item.className = 'bookie__result__item';

      list.appendChild(item);
    });
  }

  async function request<TResponse>(
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
