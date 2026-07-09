import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { navbarStyles } from "../assets/dummyStyles";
import {
  SignedIn,
  SignedOut,
  useUser,
  useAuth,
  useClerk,
} from "@clerk/clerk-react";

export default function Navbar() {
  const [open, setOpen] = useState(false); // mobile menu
  const [profileOpen, setProfileOpen] = useState(false); // avatar popover

  const { user } = useUser(); // may be undefined when signed out
  const { getToken, isSignedIn } = useAuth();
  const clerk = useClerk(); // Clerk instance (may be undefined in some test environments)

  const navigate = useNavigate();

  const profileRef = useRef(null);
  const TOKEN_KEY = "token";

  // Safe token fetch + store helper with optional forceRefresh retry
  const fetchAndStoreToken = useCallback(async () => {
    try {
      if (!getToken) {
        // getToken not ready
        return null;
      }
      const token = await getToken().catch(() => null);
      if (token) {
        try {
          localStorage.setItem(TOKEN_KEY, token);
        } catch (e) {
          // ignore localStorage errors (private mode, etc.)
          // console.warn("Saving token to localStorage failed:", e);
        }
        // optional debug
        // console.log("🔐 Clerk token saved → localStorage");
        return token;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  }, [getToken]);

  // Keep localStorage token in sync with Clerk auth state
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (isSignedIn) {
        // try normal fetch
        const t = await fetchAndStoreToken({ template: "default" }).catch(
          () => null
        );

        if (!t && mounted) {
          // retry once forcing refresh (useful if token not yet available)
          await fetchAndStoreToken({ forceRefresh: true }).catch(() => null);
        }
      } else {
        // signed out: remove token
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch {}
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isSignedIn, user, fetchAndStoreToken]);

  // Redirect user to app home after successful sign-in if on auth pages
  useEffect(() => {
    if (isSignedIn) {
      const pathname = window.location.pathname || "/";
      if (
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname.startsWith("/auth") ||
        pathname === "/"
      ) {
        navigate("/app/dashboard", { replace: true });
      }
    }
  }, [isSignedIn, navigate]);

  // Close profile popover on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", onDocClick);
      document.addEventListener("touchstart", onDocClick);
    }
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
    };
  }, [profileOpen]);

  // Display name fallback
  const displayName =
    user?.firstName ||
    user?.fullName ||
    (user?.emailAddresses && user.emailAddresses[0]?.emailAddress) ||
    "Account";

  // Email fallback
  const primaryEmail =
    user?.primaryEmailAddress?.emailAddress ||
    (user?.emailAddresses && user.emailAddresses[0]?.emailAddress) ||
    "";

  // Profile image URL (Clerk may provide different keys)
  const avatarUrl =
    user?.imageUrl || user?.profileImageUrl || user?.profile_image_url || null;

  // Open Clerk-managed profile page if clerk exposes helper, otherwise navigate to in-app profile
  function handleOpenAccount() {
    if (clerk && typeof clerk.openUserProfile === "function") {
      try {
        clerk.openUserProfile();
        setProfileOpen(false);
        return;
      } catch (e) {
        // fallthrough
      }
    }
    navigate("/app/business");
    setProfileOpen(false);
  }

  // Open Clerk sign-in modal (fallback to route if clerk unavailable)
  function openSignIn() {
    try {
      if (clerk && typeof clerk.openSignIn === "function") {
        clerk.openSignIn();
      } else {
        navigate("/login");
      }
    } catch (e) {
      console.error("openSignIn failed:", e);
      navigate("/login");
    }
  }

  // Open Clerk sign-up modal (fallback to route if clerk unavailable)
  function openSignUp() {
    try {
      if (clerk && typeof clerk.openSignUp === "function") {
        clerk.openSignUp();
      } else {
        navigate("/signup");
      }
    } catch (e) {
      console.error("openSignUp failed:", e);
      navigate("/signup");
    }
  }

  return (
    <header className={navbarStyles.header}>
      <div className={navbarStyles.container}>
        <nav className={navbarStyles.nav}>
          <div className={navbarStyles.logoSection}>
            <Link to="/" className={navbarStyles.logoLink}>
              <img
                src={logo}
                alt="InvoiceAI Logo"
                className={navbarStyles.logoImage}
              />
              <span className={navbarStyles.logoText}>InvoiceAI</span>
            </Link>

            <div className={navbarStyles.desktopNav}>
              <a href="#features" className={navbarStyles.navLink}>
                Features
              </a>
              <a href="#pricing" className={navbarStyles.navLinkInactive}>
                Pricing
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={navbarStyles.authSection}>
              {/* When signed out: use Clerk modal openers instead of Links */}
              <SignedOut>
                <button
                  onClick={openSignIn}
                  className={navbarStyles.signInButton}
                  type="button"
                >
                  Sign in
                </button>

                <button
                  onClick={openSignUp}
                  className={navbarStyles.signUpButton}
                  type="button"
                >
                  <div className={navbarStyles.signUpOverlay}></div>
                  <span className={navbarStyles.signUpText}>Get started</span>
                  <svg
                    className={navbarStyles.signUpIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </button>
              </SignedOut>

              {/* When signed in */}
              <SignedIn>
                <div
                  ref={profileRef}
                  className={navbarStyles.signedInContainer}
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  {/* Avatar button */}
                  <button
                    onClick={() => setProfileOpen((s) => !s)}
                    aria-haspopup="true"
                    aria-expanded={profileOpen}
                    className={navbarStyles.avatarButton ?? ""}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          objectFit: "cover",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          background: "#eef2ff",
                          color: "#4f46e5",
                          fontWeight: 600,
                        }}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Name clickable to open app */}
                  <Link
                    to="/app"
                    className={navbarStyles.signedInName}
                    title="Open app"
                    style={{ textDecoration: "none" }}
                  >
                    {displayName}
                  </Link>

                  {/* Profile popover card */}
                  {profileOpen && (
                    <div
                      role="dialog"
                      aria-label="Account menu"
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 8px)",
                        zIndex: 60,
                        width: 260,
                        background: "white",
                        borderRadius: 10,
                        boxShadow: "0 10px 30px rgba(2,6,23,0.12)",
                        padding: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              display: "grid",
                              placeItems: "center",
                              background: "#eef2ff",
                              color: "#4f46e5",
                              fontWeight: 700,
                              fontSize: 18,
                            }}
                          >
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>
                            {displayName}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#6b7280",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {primaryEmail || "No email"}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          height: 1,
                          background: "#f3f4f6",
                          margin: "10px 0",
                          borderRadius: 2,
                        }}
                      />

                      <div style={{ display: "grid", gap: 8 }}>
                        <button
                          onClick={() => {
                            navigate("/app/business");
                            setProfileOpen(false);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 10px",
                            borderRadius: 8,
                            background: "#f8fafc",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Manage Business Profile
                        </button>

                        <button
                          onClick={handleOpenAccount}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 10px",
                            borderRadius: 8,
                            background: "white",
                            border: "1px solid #eef2f6",
                            cursor: "pointer",
                          }}
                        >
                          Manage Account
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </SignedIn>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle navigation"
              className={navbarStyles.mobileMenuButton}
            >
              <div className={navbarStyles.mobileMenuIcon}>
                <span
                  className={`${navbarStyles.mobileMenuLine1} ${
                    open
                      ? navbarStyles.mobileMenuLine1Open
                      : navbarStyles.mobileMenuLine1Closed
                  }`}
                />
                <span
                  className={`${navbarStyles.mobileMenuLine2} ${
                    open
                      ? navbarStyles.mobileMenuLine2Open
                      : navbarStyles.mobileMenuLine2Closed
                  }`}
                />
                <span
                  className={`${navbarStyles.mobileMenuLine3} ${
                    open
                      ? navbarStyles.mobileMenuLine3Open
                      : navbarStyles.mobileMenuLine3Closed
                  }`}
                />
              </div>
            </button>
          </div>
        </nav>
      </div>

      <div
        className={`${open ? "block" : "hidden"} ${navbarStyles.mobileMenu}`}
      >
        <div className={navbarStyles.mobileMenuContainer}>
          <a href="#features" className={navbarStyles.mobileNavLink}>
            Features
          </a>
          <a href="#pricing" className={navbarStyles.mobileNavLink}>
            Pricing
          </a>
          <a href="#faq" className={navbarStyles.mobileNavLink}>
            FAQ
          </a>

          <div className={navbarStyles.mobileAuthSection}>
            <SignedOut>
              <button
                onClick={openSignIn}
                className={navbarStyles.mobileSignIn}
              >
                Sign in
              </button>
              <button
                onClick={openSignUp}
                className={navbarStyles.mobileSignUp}
              >
                Get started
              </button>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}
