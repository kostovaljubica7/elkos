document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  
    const highlightNavLink = () => {
      let scrollPosition = window.scrollY;
  
      // If we're at the top of the page, activate the first link
      if (scrollPosition === 0) {
        navLinks[0].classList.add("active");
        navLinks.forEach((link, index) => {
          if (index !== 0) link.classList.remove("active");
        });
        return;
      }
  
      // Loop through each nav link to find which section is in view
      navLinks.forEach(link => {
        const section = document.querySelector(link.getAttribute("href"));
        if (section && section.offsetTop <= scrollPosition + 100 && section.offsetTop + section.offsetHeight > scrollPosition + 100) {
          navLinks.forEach(nav => nav.classList.remove("active"));
          link.classList.add("active");
        }
      });
    };
  
    // Trigger the function when scrolling
    window.addEventListener("scroll", highlightNavLink);
  
    // Call the function once when the page loads to select the first link
    highlightNavLink();
});
    
document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const navbarCollapse = document.getElementById('navbarCollapse');
        if (navbarCollapse.classList.contains('show')) {
            navbarCollapse.classList.remove('show')
        }
    });
});
      

window.addEventListener('load', function() {
    setTimeout(function() {
    document.getElementById('spinner').style.display = 'none';
    }, 500); 
});

// function toggleText() {
//     var text = document.getElementById('hiddenDescriptionAboutUS');
//     if (text.style.display === "none") {
//     text.style.display = "block";
//     } else {
//     text.style.display = "none";
//     }
// }


document.addEventListener('DOMContentLoaded', function () {
    // Get all the "Show More" buttons
    const showMoreButtons = document.querySelectorAll('.toggle-text');

    // Iterate over each button and add the click event
    showMoreButtons.forEach(button => {
        button.addEventListener('click', function () {
            console.info('cliked')
            // Find the paragraph element inside the same .service-text container
            const paragraph = this.closest('.service-text').querySelector('p');

            // Change the -webkit-line-clamp to 10 for showing more lines
            paragraph.style.webkitLineClamp = 10;

            // Hide the "Show More" button after it is clicked
            this.style.display = 'none';
        });
    });
});



