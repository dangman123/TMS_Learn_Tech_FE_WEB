/*-----------------------------------------------------------------

Template Name:  Learnit - Education & Online Courses Html Template
Author:  Gramentheme
Author URI: https://themeforest.net/user/gramentheme/portfolio
Developer: Kawser Ahmed Roni
Version: 1.0.0
Description: Learnit - Education & Online Courses Html5 Template

-------------------------------------------------------------------
CSS TABLE OF CONTENTS
-------------------------------------------------------------------

01. preloader
02. header
03. swiper slider
04. animated text with swiper slider
05. shop products count
06. image src change
07. hide & show a div
08. isotope
09. add class & remove class
10. magnificPopup
11. back to top
12. data backgrund
13. coundown by click
14. remove products
15. wow animation

------------------------------------------------------------------*/

(function ($) {
	// Preloader area start here ***
	var windowOn = $(window);
	windowOn.on("load", function () {
		$("#loading").fadeOut(500);
	});
	// Preloader area end here ***

	// Header area start here ***
	// Mobile menu
	$(".header-area nav").meanmenu();

	// Menu Fixed
	var fixed_top = $(".header-area");
	$(window).on("scroll", function () {
		if ($(this).scrollTop() > 50) {
			fixed_top.addClass("menu-fixed animated fadeInDown");
		} else {
			fixed_top.removeClass("menu-fixed fadeInDown");
		}
	});
	// Header area end here ***

	// Banner slider area start here ***
	var swiper = new Swiper(".banner-nine__slider", {
		loop: "true",
		effect: "fade",
		speed: 1000,
		autoplay: {
			delay: 4000,
			disableOnInteraction: false,
		},
		pagination: {
			el: ".banner-nine__dot",
			clickable: true,
		},
	});
	// Banner slider area end here ***

	// Brand slider area start here ***
	var swiper = new Swiper(".brand__slider", {
		loop: "true",
		spaceBetween: 24,
		speed: 2000,
		autoplay: {
			delay: 200,
			disableOnInteraction: false,
		},
		breakpoints: {
			1200: {
				slidesPerView: 6,
			},
			992: {
				slidesPerView: 5,
			},
			575: {
				slidesPerView: 4,
			},
			320: {
				slidesPerView: 3,
			},
		},
	});

	var swiper = new Swiper(".brand-three__slider", {
		loop: "true",
		spaceBetween: 24,
		speed: 2000,
		autoplay: {
			delay: 200,
			disableOnInteraction: false,
		},
		breakpoints: {
			1200: {
				slidesPerView: 5,
			},
			992: {
				slidesPerView: 5,
			},
			575: {
				slidesPerView: 3,
			},
			320: {
				slidesPerView: 2,
			},
		},
	});

	var swiper = new Swiper(".brand-nine__slider", {
		loop: "true",
		spaceBetween: 24,
		speed: 2000,
		autoplay: {
			delay: 200,
			disableOnInteraction: false,
		},
		breakpoints: {
			1200: {
				slidesPerView: 5,
			},
			992: {
				slidesPerView: 4,
			},
			575: {
				slidesPerView: 3,
			},
			320: {
				slidesPerView: 2,
			},
		},
	});

	var swiper = new Swiper(".brand-ten__slider", {
		loop: "true",
		spaceBetween: 0,
		speed: 500,
		navigation: {
			nextEl: ".brand-ten__arry-next",
			prevEl: ".brand-ten__arry-prev",
		},
		breakpoints: {
			1200: {
				slidesPerView: 5,
			},
			992: {
				slidesPerView: 4,
			},
			575: {
				slidesPerView: 3,
			},
			320: {
				slidesPerView: 2,
			},
		},
	});
	// Brand slider area end here ***

	// Courses slider area start here ***
	var swiper = new Swiper(".courses__slider", {
		loop: "true",
		spaceBetween: 24,
		speed: 300,
		navigation: {
			nextEl: ".courses__arry-next",
			prevEl: ".courses__arry-prev",
		},
		breakpoints: {
			1200: {
				slidesPerView: 3,
			},
			767: {
				slidesPerView: 2,
			},
			575: {
				slidesPerView: 1,
			},
		},
	});

	var swiper = new Swiper(".courses-four__slider", {
		loop: "true",
		spaceBetween: 24,
		speed: 1000,
		autoplay: {
			delay: 4000,
			disableOnInteraction: false,
		},
		pagination: {
			el: ".courses-four__dot",
			clickable: true,
		},
		breakpoints: {
			1200: {
				slidesPerView: 3,
			},
			767: {
				slidesPerView: 2,
			},
			575: {
				slidesPerView: 1,
			},
		},
	});
	// Courses slider area end here ***

	// Event slider area start here ***
	var swiper = new Swiper(".event__slider", {
		loop: "true",
		spaceBetween: 24,
		speed: 300,
		navigation: {
			nextEl: ".event__arry-next",
			prevEl: ".event__arry-prev",
		},
		breakpoints: {
			1200: {
				slidesPerView: 3,
			},
			767: {
				slidesPerView: 2,
			},
			575: {
				slidesPerView: 1,
			},
		},
	});
	// Event slider area end here ***

	// Gallery slider area start here ***
	var swiper = new Swiper(".gallery__slider", {
		loop: "true",
		spaceBetween: 24,
		speed: 1000,
		autoplay: {
			delay: 4000,
			disableOnInteraction: false,
		},
		pagination: {
			el: ".gallery__dot",
			clickable: true,
		},
		breakpoints: {
			1200: {
				slidesPerView: 4,
			},
			767: {
				slidesPerView: 3,
			},
			320: {
				slidesPerView: 2,
			},
		},
	});

	var swiper = new Swiper(".gallery-seven__slider", {
		loop: "true",
		spaceBetween: 0,
		speed: 1000,
		autoplay: {
			delay: 4000,
			disableOnInteraction: false,
		},
		pagination: {
			el: ".gallery__dot",
			clickable: true,
		},
		breakpoints: {
			1200: {
				slidesPerView: 5,
			},
			991: {
				slidesPerView: 4,
			},
			767: {
				slidesPerView: 3,
			},
			320: {
				slidesPerView: 2,
			},
		},
	});
	// Gallery slider area end here ***

	// Team slider area start here ***
	var swiper = new Swiper(".team-two__slider", {
		loop: "true",
		spaceBetween: 24,
		speed: 300,
		navigation: {
			nextEl: ".team-two__arry-next",
			prevEl: ".team-two__arry-prev",
		},
		breakpoints: {
			1200: {
				slidesPerView: 4,
			},
			992: {
				slidesPerView: 3,
			},
			575: {
				slidesPerView: 2,
			},
		},
	});

	var swiper = new Swiper(".team-four__slider", {
		loop: "true",
		spaceBetween: 24,
		speed: 300,
		navigation: {
			nextEl: ".team-two__arry-next",
			prevEl: ".team-two__arry-prev",
		},
		breakpoints: {
			1200: {
				slidesPerView: 3,
			},
			992: {
				slidesPerView: 3,
			},
			575: {
				slidesPerView: 2,
			},
		},
	});
	// Team slider area end here ***

	// Testimonial slider area start here ***
	var imageSlider = new Swiper(".testimonial__slider-image", {
		loop: "true",
		spaceBetween: 60,
		speed: 300,
		autoplay: {
			delay: 5000,
			disableOnInteraction: false,
		},
	});
	var contentSlider = new Swiper(".testimonial__slider", {
		loop: "true",
		spaceBetween: 60,
		speed: 300,
		autoplay: {
			delay: 5000,
			disableOnInteraction: false,
		},
		pagination: {
			el: ".testimonial__dot",
			clickable: true,
		},
	});
	imageSlider.controller.control = contentSlider;
	contentSlider.controller.control = imageSlider;

	var swiper = new Swiper(".testimonial-two__slider", {
		loop: "true",
		spaceBetween: 24,
		speed: 300,
		navigation: {
			nextEl: ".testimonial-two__arry-next",
			prevEl: ".testimonial-two__arry-prev",
		},
		breakpoints: {
			1200: {
				slidesPerView: 3,
			},
			992: {
				slidesPerView: 3,
			},
			767: {
				slidesPerView: 2,
			},
		},
	});

	var swiper = new Swiper(".testimonial-three__slider", {
		loop: "true",
		spaceBetween: 24,
		speed: 1000,
		centeredSlides: true,
		autoplay: {
			delay: 4000,
			disableOnInteraction: false,
		},
		pagination: {
			el: ".testimonial-three__dot",
			clickable: true,
		},
		breakpoints: {
			1600: {
				slidesPerView: 4,
			},
			1200: {
				slidesPerView: 3,
			},
			991: {
				slidesPerView: 2,
			},
			767: {
				slidesPerView: 2,
			},
		},
	});

	var swiper = new Swiper(".testimonial-four__slider", {
		loop: "true",
		spaceBetween: 30,
		speed: 1000,
		autoplay: {
			delay: 4000,
			disableOnInteraction: false,
		},
		navigation: {
			nextEl: ".testimonial-four__arry-next",
			prevEl: ".testimonial-four__arry-prev",
		},
	});

	var swiper = new Swiper(".testimonial-seven__slider", {
		loop: "true",
		spaceBetween: 24,
		speed: 1000,
		centeredSlides: true,
		autoplay: {
			delay: 4000,
			disableOnInteraction: false,
		},
		pagination: {
			el: ".testimonial-seven__dot",
			clickable: true,
		},
		breakpoints: {
			1200: {
				slidesPerView: 3,
			},
			991: {
				slidesPerView: 2,
			},
			767: {
				slidesPerView: 2,
			},
		},
	});

	var swiper = new Swiper(".testimonial-nine__slider", {
		loop: "true",
		spaceBetween: 30,
		speed: 500,
		navigation: {
			nextEl: ".testimonial-nine__arry-next",
			prevEl: ".testimonial-nine__arry-prev",
		},
		breakpoints: {
			991: {
				slidesPerView: 2,
			},
			767: {
				slidesPerView: 1,
			},
		},
	});
	// Testimonial slider area end here ***

	// Mouse move paralax area end here ***
	if ($(window).width() > 780) {
		$(".paralax__animation").mousemove(function (e) {
			$("[data-depth]").each(function () {
				var depth = $(this).data("depth");
				var amountMovedX = (e.pageX * -depth) / 4;
				var amountMovedY = (e.pageY * -depth) / 4;

				$(this).css({
					transform:
						"translate3d(" +
						amountMovedX +
						"px," +
						amountMovedY +
						"px, 0)",
				});
			});
		});
	}
	// Mouse move paralax area end here ***

	// Background image date area start here ***
	$("[data-background").each(function () {
		$(this).css(
			"background-image",
			"url( " + $(this).attr("data-background") + "  )"
		);
	});
	// Background image date area end here ***

	// Video popup area start here ***
	$(".video-popup").magnificPopup({
		type: "iframe",
		iframe: {
			markup:
				'<div class="mfp-iframe-scaler">' +
				'<div class="mfp-close"></div>' +
				'<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +
				"</div>",

			patterns: {
				youtube: {
					index: "youtube.com/",

					id: "v=",

					src: "https://www.youtube.com/embed/%id%?autoplay=1",
				},
				vimeo: {
					index: "vimeo.com/",
					id: "/",
					src: "//player.vimeo.com/video/%id%?autoplay=1",
				},
				gmaps: {
					index: "//maps.google.",
					src: "%id%&output=embed",
				},
			},

			srcAction: "iframe_src",
		},
	});
	// Video popup area end here ***

	// Counter up area start here ***
	$(".count").counterUp({
		delay: 20,
		time: 2000,
	});
	// Counter up area end here ***

	// Coundawn area start here ***
	var targetDate = new Date("2024-07-12 00:00:00").getTime();
	var countdownInterval = setInterval(function () {
		var currentDate = new Date().getTime();
		var remainingTime = targetDate - currentDate;

		if (remainingTime <= 0) {
			clearInterval(countdownInterval);
			// Display a message or perform any action when the countdown timer reaches zero
			$("#countdown-container").text("Countdown has ended!");
		} else {
			var days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
			var hours = Math.floor(
				(remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
			);
			var minutes = Math.floor(
				(remainingTime % (1000 * 60 * 60)) / (1000 * 60)
			);
			var seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

			// Pad single-digit values with leading zeros
			$("#day").text(days.toString().padStart(2, "0"));
			$("#hour").text(hours.toString().padStart(2, "0"));
			$("#min").text(minutes.toString().padStart(2, "0"));
			$("#sec").text(seconds.toString().padStart(2, "0"));
		}
	}, 1000);
	// Coundawn area end here ***

	// FullScreen search area end here ***
	var $searchWrap = $(".search-wrap");
	var $navSearch = $(".nav-search");
	var $searchClose = $("#search-close");

	$(".search-trigger").on("click", function (e) {
		e.preventDefault();
		$searchWrap.animate({ opacity: "toggle" }, 500);
		$navSearch.add($searchClose).addClass("open");
	});

	$(".search-close").on("click", function (e) {
		e.preventDefault();
		$searchWrap.animate({ opacity: "toggle" }, 500);
		$navSearch.add($searchClose).removeClass("open");
	});

	function closeSearch() {
		$searchWrap.fadeOut(200);
		$navSearch.add($searchClose).removeClass("open");
	}

	$(document.body).on("click", function (e) {
		closeSearch();
	});

	$(".search-trigger, .main-search-input").on("click", function (e) {
		e.stopPropagation();
	});
	// FullScreen search area end here ***

	// Hover add class area start here ***
	$(".topic__item").hover(function () {
		$(".topic__item").removeClass("active");
		$(this).addClass("active");
	});
	// Hover add class area start here ***

	// Nice seclect area start here ***
	$(document).ready(function () {
		$("select").niceSelect();
	});
	// Nice seclect area end here ***

	// Footer image popup start here ***
	$(".footer-popup").magnificPopup({
		type: "image",
		gallery: {
			enabled: true,
		},
	});
	// Footer image popup end here ***

	// Back to top area start here ***
	var scrollPath = document.querySelector(".scroll-up path");
	var pathLength = scrollPath.getTotalLength();
	scrollPath.style.transition = scrollPath.style.WebkitTransition = "none";
	scrollPath.style.strokeDasharray = pathLength + " " + pathLength;
	scrollPath.style.strokeDashoffset = pathLength;
	scrollPath.getBoundingClientRect();
	scrollPath.style.transition = scrollPath.style.WebkitTransition =
		"stroke-dashoffset 10ms linear";
	var updatescroll = function () {
		var scroll = $(window).scrollTop();
		var height = $(document).height() - $(window).height();
		var scroll = pathLength - (scroll * pathLength) / height;
		scrollPath.style.strokeDashoffset = scroll;
	};
	updatescroll();
	$(window).scroll(updatescroll);
	var offset = 50;
	var duration = 950;
	jQuery(window).on("scroll", function () {
		if (jQuery(this).scrollTop() > offset) {
			jQuery(".scroll-up").addClass("active-scroll");
		} else {
			jQuery(".scroll-up").removeClass("active-scroll");
		}
	});
	jQuery(".scroll-up").on("click", function (event) {
		event.preventDefault();
		jQuery("html, body").animate(
			{
				scrollTop: 0,
			},
			duration
		);
		return false;
	});
	// Back to top area end here ***

	// WOW Animatin area start here ***
	new WOW().init();
	// WOW Animatin area start here ***
})(jQuery);
