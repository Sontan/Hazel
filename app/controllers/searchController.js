"use strict";

const SearchViewModel = require("../models/searchViewModel");

class SearchController {
    constructor(server, config, authMethod, searchProvider) {
        this._server = server;
        this._config = config;
        this._auth = authMethod;
        this._searchProvider = searchProvider;

        this._bindRoutes();
    }

    _bindRoutes() {
        // /search
        this._server.get("/search", this._auth, this.index.bind(this));
        this._server.get('/externalsearch', this._auth, this.searchFromExternalPage.bind(this))
    }

    /**
     * Render the search page
     */
    index(req, res, next) {
        var viewModel = new SearchViewModel();

        if (req.query.s) {
            let term = decodeURIComponent(req.query.s);
            viewModel.searchTerm = term;
            viewModel.searchResults = this._searchProvider.search(term);
        }

        viewModel.config = this._config;

        this._renderFile(res, viewModel, 'search');
    }

    /**
     * Return matched documents with parsed markdown
     */
    searchFromExternalPage(req, res, next) {
        var viewModel = new SearchViewModel();

        if (req.query.s) {
            let term = decodeURIComponent(req.query.s);
            viewModel.searchTerm = term;
            viewModel.searchResults = this._searchProvider.searchAndParse(term);
        }

        return res.send(viewModel);
    }

    _renderFile(res, viewModel, pagename) {
        viewModel.layout = `${this._config.theme_dir}${this._config.theme_name}/templates/layout.html`;

        return res.render(require.resolve(`${this._config.theme_dir}${this._config.theme_name}/templates/${pagename}.html`), viewModel);
    }
}

module.exports = SearchController;
