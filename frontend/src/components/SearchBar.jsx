const categories = ['Electronics', 'Fashion', 'Books', 'Home']

function SearchBar({ search, category, sort, onSearchChange, onCategoryChange, onSortChange }) {
  return (
    <form className="catalog-filters" role="search" onSubmit={(event) => event.preventDefault()}>
      <label className="catalog-search">
        <span>Search products</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Try headphones or books"
        />
      </label>
      <label className="catalog-select">
        <span>Category</span>
        <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label className="catalog-select">
        <span>Sort by</span>
        <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
          <option value="">Recently added</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </label>
    </form>
  )
}

export default SearchBar