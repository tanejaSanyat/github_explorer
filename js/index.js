let i = sessionStorage.getItem("i");

let userInput = sessionStorage.getItem(`userInput${i}`);
console.log(userInput);
const fetchDetails = (userInput) => {
  fetch(`https://api.github.com/users/${userInput}`)
    .then((response) => response.json())
    .then(async (apiData) => {
      // console.log(apiData);

      // FOLLOWERS LIST
      let followersUrl = await fetch(apiData.followers_url);
      let followersResponse = await followersUrl.json();
      let followersList = "";
      for (follower of followersResponse) {
        followersList += `<span class="flex gap-4 items-center"><img src="${follower.avatar_url}" class="rounded-full w-8 aspect-square"><button type="submit" class="hover:underline underline-offset-5 cursor-pointer" onclick="getUserIndirect('${follower.login}')">${follower.login}</button></span>`;
      }
      // FOLLOWING LIST
      let followingUrl = await fetch(
        apiData.following_url.replace("{/other_user}", "")
      );
      let followingResponse = await followingUrl.json();
      let followingList = "";
      for (let following of followingResponse) {
        followingList += `<span class="flex gap-4 items-center"><img src="${following.avatar_url}" class="rounded-full w-8 aspect-square"><button type="submit" class="hover:underline underline-offset-5 cursor-pointer" onclick="getUserIndirect('${following.login}')">${following.login}</button></span>`;
      }

      // REPO LIST
      let repoUrl = await fetch(apiData.repos_url);
      let repoResponse = await repoUrl.json();
      let repoList = "";

      for (repo of repoResponse) {
        repoList += `<li onclick="selectRepo(${repo.id})">${repo.name}</li>`;
      }

      // Seting Details
      document.getElementById("name").innerText = apiData.name;
      document.getElementById("username").innerText = "@" + apiData.login;
      document.getElementById("avatar").src = apiData.avatar_url;
      document.getElementById("url").href = apiData.html_url;
      document.getElementById("followers-count").innerText = apiData.followers;
      document.getElementById("following-count").innerText = apiData.following;
      document.getElementById("followers-list-count").innerText =
        "(" + apiData.followers + ")";
      document.getElementById("following-list-count").innerText =
        "(" + apiData.following + ")";

      document.getElementById("bio").innerText = apiData.bio;
      if (apiData.location != null)
        document.getElementById("location").innerHTML =
          `<i class="fa-solid fa-location-dot mr-2"></i
      >` + apiData.location;
      else document.getElementById("location").innerHTML = "";
      document.getElementById("repo-count").innerText = apiData.public_repos;
      document.getElementById("repo-list-count").innerText =
        "(" + apiData.public_repos + ")";

      document.getElementById("followers-list").innerHTML =
        `<form class="w-max pt-4 max-h-72 overflow-scroll flex flex-col gap-2 items-start text-base font-light" action="user.html">` +
        followersList +
        `</form>`;
      document.getElementById("following-list").innerHTML =
        `<form class="w-max pt-4 max-h-72 overflow-scroll flex flex-col gap-2 items-start text-base font-light" action="user.html">` +
        followingList +
        `</form>`;
      document.getElementById("repo-list").innerHTML = repoList;
      document.getElementById("created").innerText = moment(
        apiData.created_at
      ).format("Do MMMM YYYY");
      document.getElementById("updated").innerText = moment(
        apiData.updated_at
      ).format("Do MMMM YYYY");
    })
    .then(() => {
      document.getElementById("loader").classList.add("hidden");
      document.getElementById("loader").classList.remove("flex");
      document.getElementById("user-details").classList.remove("hidden");
      document.getElementById("user-details").classList.add("flex");
      document.getElementById("text-repo").classList.remove("hidden");
    })
    .catch((error) => {
      document.getElementById("loader").classList.add("hidden");
      document.getElementById("loader").classList.remove("flex");
      alert(error);
      console.log(error);
      window.location.pathname = "/";
      sessionStorage.clear();
    });
};

if (userInput === "null" || userInput == null) {
  window.location.pathname = "/";
} else {
  fetchDetails(userInput);
}

const getUserIndirect = (loginId) => {
  userInput = loginId;
  i++;
  sessionStorage.setItem("i", i);
  sessionStorage.setItem(`userInput${i}`, userInput);
  console.log(i);
};

const perfEntries = performance.getEntriesByType("navigation");
if (perfEntries.length && perfEntries[0].type === "back_forward") {
  // console.log("User got here from Back or Forward button.");
  if (i >= 0) {
    let j = sessionStorage.i;
    j--;
    sessionStorage.i = j;
    console.log(j);
    let userSelect = sessionStorage.getItem(`userInput${j}`);
    console.log(sessionStorage);
    fetchDetails(userSelect);
  } else {
    window.location.pathname = "/";
    sessionStorage.clear();
  }
}

let selectedRepo;

const apiDataCollect = fetch(`https://api.github.com/users/${userInput}/repos`)
  .then((response) => response.json())
  .then((apiData) => {
    return apiData;
  });
const selectRepo = (repoId) => {
  document.getElementById("text-repo").classList.add("hidden");
  document.getElementById("loader-repo").classList.remove("hidden");
  document.getElementById("loader-repo").classList.add("flex");
  document.getElementById("repo-section").classList.add("hidden");
  document.getElementById("repo-section").classList.remove("flex");
  apiDataCollect
    .then(async (repos) => {
      // console.log(repos);
      for (let repo of repos) {
        // console.log(repo.name);

        if (repo.id === repoId) {
          selectedRepo = repo;
          break;
        }
      }
      let commitUrl = await fetch(
        selectedRepo.commits_url.replace("{/sha}", "")
      );
      let commitResponse = await commitUrl.json();
      let commitCount = 0;
      for (commit of commitResponse) {
        commitCount++;
      }
      console.log(selectedRepo);
      document.getElementById("repo-name").innerText = selectedRepo.name;
      document.getElementById("owner-img").src = selectedRepo.owner.avatar_url;
      document.getElementById("repo-link").innerText = selectedRepo.full_name;
      document.getElementById("repo-link").href = selectedRepo.html_url;
      document.getElementById("repo-owner").innerText =
        selectedRepo.owner.login;
      document.getElementById("repo-desc").innerText = selectedRepo.description;
      document.getElementById("repo-stars").innerText =
        selectedRepo.stargazers_count;
      document.getElementById("repo-forks").innerText =
        selectedRepo.forks_count;
      document.getElementById("repo-commits").innerText = commitCount;
      document.getElementById("repo-created").innerText = moment(
        selectedRepo.created_at
      ).format("Do MMMM YYYY");
      document.getElementById("repo-updated").innerText = moment(
        selectedRepo.updated_at
      ).format("Do MMMM YYYY");
    })
    .then(() => {
      document.getElementById("loader-repo").classList.add("hidden");
      document.getElementById("loader-repo").classList.remove("flex");
      document.getElementById("repo-section").classList.remove("hidden");
      document.getElementById("repo-section").classList.add("flex");
    });
};

function openDetail(evt, detail) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    if (!tabcontent[i].classList.contains("hidden")) {
      tabcontent[i].classList.add("hidden");
    }
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", " ");
  }
  evt.currentTarget.className += " active";
  if (evt.currentTarget.classList.contains("active")) {
    document.getElementById(detail).className = document
      .getElementById(detail)
      .className.replace(" hidden", " flex");
  }
}
