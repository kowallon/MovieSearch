const searchBtn = document.getElementById("searchBtn")
const searchBox = document.getElementById("searchBox")


let searchedMovie
let moviesArr 
let moviesOnWatchlist = []
let savedMovies = []
let isAdded = false

//Render watchlist
function renderWatchlist(){
    if (window.location.pathname == '/watchlist.html') {
        document.getElementById("movieList").innerHTML = ""
            savedMovies = JSON.parse(localStorage.getItem("moviesOnWatchlist"))

            savedMovies.map(function(singleMovieId){
                fetch(`http://www.omdbapi.com/?i=${singleMovieId}&apikey=d7841fbf`)
                .then(res => res.json())
                .then(data => data)
                .then(moviesArr =>{
                    hidePlaceholder()
                    document.getElementById("movieList").innerHTML += `
                    <div class="movie">
                        <div class="mainWrap">
                            <img src="${moviesArr.Poster}" alt="" class="poster">
                            <div class="infoWrap">
                                <div class="titleWrap">
                                    <h3>${moviesArr.Title}</h3>
                                    <h4 class="rating"><i class="fa-solid fa-star"></i> ${moviesArr.imdbRating}</h4>
                                </div>
                                <div class="detailsWrap">
                                    <p>${moviesArr.Runtime}</p>
                                    <p>${moviesArr.Genre}</p>
                                    <p class="addToWatchlist" data-likedid="${singleMovieId}"><i id="minus" class="fa-solid fa-circle-minus" data-likedid="${singleMovieId}"></i> Remove</p>
                                </div>
                                <div class="description">
                                    <p>${moviesArr.Plot}</p>
                                </div>
                            </div> 
                        </div>
                    `
                })
            })
        }    
}

renderWatchlist()


document.body.addEventListener("click", function(e){
    if (window.location.pathname == '/watchlist.html' && e.target.dataset.likedid) {
        let movieToRemove = e.target.dataset.likedid

        let arrayOfLikedMovies = JSON.parse(localStorage.getItem("moviesOnWatchlist"))

        let deletedIndex = arrayOfLikedMovies.indexOf(movieToRemove)
        arrayOfLikedMovies.splice(deletedIndex, 1)

        localStorage.removeItem("moviesOnWatchlist")
        localStorage.setItem("moviesOnWatchlist", JSON.stringify(arrayOfLikedMovies))   
        renderWatchlist()     
    }
})


//Search for movies
searchBtn.addEventListener("click",function(){
    let idsInStorage = localStorage.getItem("moviesOnWatchlist")
    document.getElementById("movieList").innerHTML = ``
    //I grab movie title to use it in api call
    searchedMovie = searchBox.value
    fetch(`http://www.omdbapi.com/?i=tt0075148&apikey=d7841fbf&s=${searchedMovie}`)
        .then(response => response.json())
        .then(data => {
            if(data.Response == "False"){
                console.log("no matches")  
                document.getElementById("pc1").classList.add("hidden")
                document.getElementById("pc2").textContent = "Unable to find what you’re looking for. Please try another search."
            } else {
                hidePlaceholder()
                let resultsArr = data.Search
                //Second fetch is performed with movie ID, because request with this param provides more data about movie like description or poster
                //map is used because multiple (array of) movies may contain same string in name
                resultsArr.map(function(result){
                    fetch(`http://www.omdbapi.com/?i=${result.imdbID}&apikey=d7841fbf`)
            
                    .then(res => res.json())
                    .then(movieData =>{
                        return movieData
                    })
                    //Render html with results
                    .then(moviesArr =>{
                        //check if movie is already liked to change its icon
                        if(idsInStorage && idsInStorage.includes(moviesArr.imdbID)){
                            document.getElementById("movieList").innerHTML += `
                            <div class="movie">
                                <div class="mainWrap">
                                    <img src="${moviesArr.Poster}" alt="" class="poster">
                                    <div class="infoWrap">
                                        <div class="titleWrap">
                                            <h3>${moviesArr.Title}</h3>
                                            <h4 class="rating"><i class="fa-solid fa-star"></i> ${moviesArr.imdbRating}</h4>
                                        </div>
                                        <div class="detailsWrap" id="details">
                                            <p>${moviesArr.Runtime}</p>
                                            <p>${moviesArr.Genre}</p>
                                            <p class="added"><i class="fa-solid fa-circle-check" data-like="true"></i> Already on watchlist</p>
                                        </div>
                                        <div class="description">
                                            <p>${moviesArr.Plot}</p>
                                        </div>
                                    </div> 
                                </div>
                            `
                        }
            
                        else {
                        document.getElementById("movieList").innerHTML += `
                        <div class="movie">
                            <div class="mainWrap">
                                <img src="${moviesArr.Poster}" alt="" class="poster">
                                <div class="infoWrap">
                                    <div class="titleWrap">
                                        <h3>${moviesArr.Title}</h3>
                                        <h4 class="rating"><i class="fa-solid fa-star"></i> ${moviesArr.imdbRating}</h4>
                                    </div>
                                    <div class="detailsWrap" id="details">
                                        <p>${moviesArr.Runtime}</p>
                                        <p>${moviesArr.Genre}</p>
                                        <p id="${moviesArr.imdbID}" class="addToWatchlist" data-filmid="${moviesArr.imdbID}"><i id="addIcon" class="fa-solid fa-circle-plus" data-filmid="${moviesArr.imdbID}" data-like="false"></i> Watchlist</p>
                                    </div>
                                    <div class="description">
                                        <p>${moviesArr.Plot}</p>
                                    </div>
                                </div> 
                            </div>
                        `
                    }
                    })
                })
               
            }
            
        })
})


function hidePlaceholder() {
    //that's a bit clumsy, I'll refactor it when I have some time
    if(document.getElementById("pc1") && document.getElementById("pc2")){
    document.getElementById("pc1").remove()
    document.getElementById("pc2").remove()
    } else if(document.getElementById("pc3") && document.getElementById("pc4")){
        document.getElementById("pc3").remove()
        document.getElementById("pc4").remove()
        }
}

//Add to watchlist
document.body.addEventListener("click", function(e){
    //this var enables adding IDs if localStorage is not empty
    let moviesAlreadyOnWatchlist = localStorage.getItem("moviesOnWatchlist")
    if(e.target.dataset.filmid && moviesAlreadyOnWatchlist){
        //first I need to get localstorage, otherwise it was replacing old ids with new
        moviesOnWatchlist = JSON.parse(localStorage.getItem("moviesOnWatchlist")) 
        moviesOnWatchlist.push(e.target.dataset.filmid)
        localStorage.setItem("moviesOnWatchlist", JSON.stringify(moviesOnWatchlist))
        console.log(e.target.dataset.filmid)
        document.getElementById(e.target.dataset.filmid).innerHTML = `<i class="fa-solid fa-circle-check added" data-like="true"></i> Already on watchlist`
        document.getElementById(e.target.dataset.filmid).classList.add("added")
        }
    
    else if(e.target.dataset.filmid && moviesAlreadyOnWatchlist === null){
        //If localstorage is empty, theres no need to get old ids first as nothing will be replaced
        moviesOnWatchlist.push(e.target.dataset.filmid)   
        console.log(moviesOnWatchlist)
        localStorage.setItem("moviesOnWatchlist", JSON.stringify(moviesOnWatchlist))
        document.getElementById(e.target.dataset.filmid).innerHTML = `<i class="fa-solid fa-circle-check added"></i> Already on watchlist`
        document.getElementById(e.target.dataset.filmid).classList.add("added")    
    }

})

