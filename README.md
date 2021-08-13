# Bookie

Loads a Zotero `json` export file with a `tag` property like this:  

```json
"tags": [
    {
        "tag": "China"
    },
    {
        "tag": "Wuhan"
    }
],
```

The array of tags will be read from each object in the list and a series of buttons presented, one for each tag. When a button is clicked, all elements having that tag will have their information displayed below.

## Usage

Copy the `dist/bookie.js` file to your server and include it in a `<script>` tag

Example:

```html
<script src="/js/bookie.js"  type="text/javascript"></script>
```

Make an HTML element with an id attribute. 

```html
<div id="bookie" class="loader">Loading data...</div>
```

Any CSS classes on the element can be added to your liking to style the element while the data is loading. All classes and content in the element will be removed when the data is loaded. The `loader` class is just an example. See the demo file for how it's used.

Instantiate the Bookie class and initialize it with `bookie.init(<id for the element you want to use>, <url/path to the json file with sources>)`.

Example:

```html
<script  type="text/javascript">
    const bookie = new Bookie();
    bookie.init("bookie", "https://example.net/bookie/sources.json");
</script>
```

The following CSS classes can be used to style the generated content:

```css
bookie__tags
bookie__tag
bookie__result
bookie__result__list
bookie__result__item
```

The resulting HTML is structured like this:

```html
<div id="bookie" class="">
    <div class="bookie__tags">
        <button class="bookie__tag">tag 1</button>
        <button class="bookie__tag">tag 2</button>
    </div>
    <div class="bookie__result">
        <ul class="bookie__result__list">
            <li class="bookie__result__item">Result 1</li>
            <li class="bookie__result__item">Result 2</li>
        </ul>
    </div>
</div>
```

See [`/demo/index.html`](demo/index.html) for sample styling

## Development and testing

### Local setup

1. Clone the repository
2. Run `yarn install`

### Run demo

Run `yarn serve`

### Making changes

Run `yarn watch` to set up automatic build of the TypeScript file

Edit the `src/bookie.ts` file.

