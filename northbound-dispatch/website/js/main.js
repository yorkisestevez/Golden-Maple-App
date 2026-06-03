/* Northbound Dispatch — landing page interactions */
(function () {
  "use strict";

  /* ---- Footer year ---- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Mobile nav toggle ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Animated hero grid / highway lines ---- */
  var canvas = document.querySelector(".hero-grid");
  if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ctx = canvas.getContext("2d");
    var w, h, offset = 0;
    var SPACING = 46;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      w = canvas.width = rect.width * dpr;
      h = canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      var rw = w / (window.devicePixelRatio || 1);
      var rh = h / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, rw, rh);

      // perspective grid converging toward upper-right vanishing point
      ctx.strokeStyle = "rgba(27, 153, 139, 0.18)"; // teal
      ctx.lineWidth = 1;
      var vx = rw * 0.78, vy = rh * 0.1;

      // radiating "highway" lines
      for (var i = -6; i <= 14; i++) {
        ctx.beginPath();
        var x = (i / 14) * rw * 1.6;
        ctx.moveTo(x, rh);
        ctx.lineTo(vx, vy);
        ctx.stroke();
      }
      // moving horizontal rungs (scrolling toward viewer)
      ctx.strokeStyle = "rgba(255, 107, 53, 0.10)"; // orange
      for (var j = 0; j < 18; j++) {
        var t = ((j * SPACING + offset) % (rh)) / rh;
        var y = vy + t * (rh - vy);
        var spread = t;
        ctx.beginPath();
        ctx.moveTo(vx - spread * rw * 1.1, y);
        ctx.lineTo(vx + spread * rw * 0.6, y);
        ctx.stroke();
      }
      offset += 0.6;
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---- Apply form: client-side validation + graceful AJAX submit ---- */
  var form = document.getElementById("applyForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      // Basic validation beyond native required
      var email = form.querySelector("#email");
      var phone = form.querySelector("#phone");
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
      var phoneOk = phone.value.replace(/\D/g, "").length >= 10;

      if (!emailOk || !phoneOk) {
        e.preventDefault();
        setNote(
          !emailOk ? "Please enter a valid email address."
                   : "Please enter a valid phone number (10+ digits).",
          "error"
        );
        return;
      }

      // Progressive enhancement: submit via fetch so the user stays on-page.
      // If fetch fails, fall back to the normal POST (don't preventDefault then).
      if (window.fetch) {
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var original = btn.textContent;
        btn.disabled = true;
        btn.textContent = "Sending…";
        setNote("Sending your application…", "");

        fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        })
          .then(function (res) {
            if (!res.ok) throw new Error("Network response not ok");
            form.reset();
            setNote("Thanks! Your application is in. We'll be in touch fast.", "success");
            btn.textContent = "Application Sent ✓";
          })
          .catch(function () {
            // Fall back to a plain navigation submit
            setNote("", "");
            btn.disabled = false;
            btn.textContent = original;
            form.submit();
          });
      }
    });
  }

  function setNote(msg, type) {
    if (!note) return;
    note.textContent = msg || "We'll never share your info. Free to apply.";
    note.className = "form-note" + (type ? " " + type : "");
  }
})();
