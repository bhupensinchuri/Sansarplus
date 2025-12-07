# How to Create the SansarPlus WordPress Plugin ZIP

Since I cannot generate a binary `.zip` file directly, please follow these simple steps to package your application for WordPress.

## Step 1: Build the React Application

You need to compile your React code into static HTML/CSS/JS files.

1.  Open your terminal in the project folder.
2.  Run the build command:
    ```bash
    npm run build
    ```
    *(Note: This creates a `build` folder containing your compiled app).*

## Step 2: Create the Plugin Folder Structure

1.  Create a new folder on your computer named `sansarplus-wp`.
2.  Inside this folder, create a file named `sansarplus-wp.php`.
3.  Copy the content from the `sansarplus-wp.php` file provided in this project into that file.

## Step 3: Copy the Build Files

1.  Copy the **entire** `build` folder (generated in Step 1) into your `sansarplus-wp` folder.

**Your folder structure should look like this:**
```
sansarplus-wp/
├── sansarplus-wp.php
└── build/
    ├── index.html
    ├── static/
    │   ├── css/
    │   └── js/
    └── ... other assets
```

## Step 4: Zip It

1.  Right-click the `sansarplus-wp` folder.
2.  Select **Compress to ZIP file** (or "Send to > Compressed (zipped) folder").
3.  You now have `sansarplus-wp.zip`.

## Step 5: Install on WordPress

1.  Go to your WordPress Admin Dashboard.
2.  Navigate to **Plugins > Add New**.
3.  Click **Upload Plugin**.
4.  Upload your `sansarplus-wp.zip` file.
5.  Click **Install Now** and then **Activate**.

## Step 6: Use It

1.  Create a new Page in WordPress (e.g., "Lyrics App").
2.  Add a **Shortcode** block.
3.  Type `[sansarplus]` inside the block.
4.  Publish the page. Your app is now live!

---

## ⚠️ Important Warning About Data

This application currently uses **Local Storage** to save songs, artists, and favorites.

*   **What this means:** If you log in as Admin and add a song, that song is saved **only in your specific browser**.
*   **Result:** Visitors to your WordPress site **will not see** the songs you added, because they are not stored on the WordPress server (Database).
*   **To fix this:** You would need to rewrite the `dataManager.ts` file to fetch/save data using the WordPress REST API, which requires significant backend development.

However, the "Backup/Restore" feature in the Admin Dashboard **will work**. You can export your data to a JSON file and share it, or import it on another device to sync manually.