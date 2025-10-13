

const MoviesPage = () => {

  const filteredMovies = activeCategory === 'all'
    ? movies
    : movies.filter(movie => movie.category === activeCategory);
  const COLLAPSE_COUNT = 12;

  const visibleMovies = showAll ? filteredMovies : filteredMovies.slice(0, COLLAPSE_COUNT);

  const categories = [
    { id: 'all', name: 'All Movies' },
    { id: 'action', name: 'Action' },
    { id: 'horror', name: 'Horror' },
    { id: 'comedy', name: 'Comedy' },
    { id: 'adventure', name: 'Adventure' }
  ];

};

export default MoviesPage;