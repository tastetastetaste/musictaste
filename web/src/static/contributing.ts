export const CONTRIBUTING_MD = `# Contributing to the Database

## Adding Data

You can start contributing data by selecting **"Add Release"** from the dropdown that appears when you click your avatar in the top right corner.

- **Title**: The title of the release.  
- **Artist/Band**: Select the artist or band.  
  - If you don't find the artist, click **"Add new artist"** below the input field to add a new artist to the database.  
  - If the name is in non-Latin text, use the localized English name followed by the original non-Latin text in square brackets (e.g., *Ichiko Aoba [青葉市子]*) to make it easier to search.  
- **Type**: Select the release type.  
  - The list of types is self-explanatory, but note that we use **"Reissue"** as the type for deluxe and extended editions.  
- **Date**: Release date.  
  - Accepted formats: YYYY, YYYY-MM, YYYY-MM-DD, MM/DD/YYYY, MM-DD-YYYY, or MMM DD, YYYY.  
- **Label**: Select the label.  
  - If you don't find the label, click **"Add new label"** below the input field to add a new one to the database.  
  - When adding a label, please use the full label name — not a shortened version.  
- **Language**: Select the language.  
  - If the language isn't listed, please send feedback (contact information is in the sidebar).  
- **Cover Art**: Drag and drop, or click to select cover art.  
- **Add Tracks**: Click, then enter the number of tracks you want to add. Fill in the titles and (optionally) the length for each track.  
- **Note/Source**: You may add a note for the person reviewing your contribution (optional).  
- **Submit**: Click **"Submit"** to add the release.  

#### Importing from MusicBrainz

You can autofill the fields by importing from MusicBrainz.

- Go to [https://musicbrainz.org/](https://musicbrainz.org/)  
- Navigate to the **specific release** you want to add (not the release group — make sure it's a specific issue).  
- Copy the URL of that release page.  
- Paste it into the **MusicBrainz** field.  
- Click **"Import"**.  
- Edit and fill in any missing information as necessary.

## Editing Data

- Go to the release page.  
- Click the dropdown menu in the top right corner and select **"Edit"**.  
- You will see a screen identical to the **Add Release** screen.  
- Make your changes and click **"Submit"**.  
- Edits may take up to 24 hours to be approved.

## Reporting Music Data

If you find incorrect or inappropriate data, you can report it directly:

- Go to the specific entry (e.g., a release, artist, or label) you want to report.  
- Click the dropdown menu in the top right corner and select **"Report"**.  
- Enter the reason for the report in the text field.  
- Click **Send** to submit the report.

## Contribution Statuses

Each music data contribution goes through an approval process and is assigned one of the following statuses:

- **AUTO APPROVED**
	- The contribution has been automatically added to the database but still requires manual review for accuracy.
	- **If approved:** The data will remain unchanged.
	- **If disapproved:** The data will be removed from the database.
- **OPEN**
	- The contribution is awaiting manual review and has not yet been added to the database.
	- **If approved:** The data will be added to the database.
	- **If disapproved:** The data will not be added to the database.
- **APPROVED**
	- The contribution has been reviewed and approved, and the data has been added to the database.
- **DISAPPROVED**
	- The contribution has been reviewed and rejected, and the data has not been added to the database.

## Contributor roles

Each user is assigned one of the following roles:

- **Contributor**
  - Default role upon signup.
  - Can add releases, artists, and labels.
      - New additions are automatically added to the database (AUTO APPROVED).
      - Edits to existing releases require review (OPEN).
- **Trusted Contributor**
  - Can perform all actions of a Contributor.
  - Can vote on contributions submitted by other users.
      - If a contribution receives more upvotes than downvotes, it gets approved.
      - Three votes will finalize the contribution.
- **Editor**
  - Can add and edit music data directly without review.
  - Can approve or reject contributions submitted by other users.

## Feedback

We welcome your feedback and suggestions. You'll find our contact information and social media links in the sidebar.`;
