import {
  getArtistPath,
  getGenrePath,
  getLabelPath,
  getReleasePath,
} from 'shared';

export const CONTRIBUTING_MD = `# Contributing to the Database

## General Guidelines

- AI-generated music is not allowed in the database.
- You should create an artist page only when you are adding a release for that artist. Don't create empty artist pages just to reference them.
- Always include helpful notes with sources. Every submission is reviewed on its own, so notes like 'Add tracklist' or 'Fix date' are not enough without a supporting source.
- Don't add or edit data if it doesn't have a public source to verify it.

## Adding Releases

You can start contributing data by selecting **"Add Release"** from the dropdown that appears when you click your avatar in the top right corner.

- **Title**: The original title of the release.  
- **English / Latin-script title (if applicable)**: The title of the release in English or Latin-script if the original title is in non-Latin script.
- **Artist/Band**: Select the artist or band.  
  - For classical music, use all performers and composers as artists.
  - If you don't find the artist, click **"Add new artist"** below the input field to add a new artist to the database. (refer to the section below for information on adding artists)
  - If you know the artist is in the database but can't find them, click **"Select by ID"** below the input field to select the artist by ID. Artist ID can be copied from the top right menu of the artist page.
- **Type**: Select the release type.  
- **Date**: Release date.  
  - Accepted formats: YYYY, YYYY-MM, YYYY-MM-DD, MM/DD/YYYY, MM-DD-YYYY, or MMM DD, YYYY.  
- **Label**: Select the label.  
  - If it doesn't have a label, use **"Not On Label (Self-Released)"** as a label.
  - If you don't find the label, click **"Add new label"** below the input field to add a new one to the database.  
    - When adding a label, please use the full label name — not a shortened version.  
  - Similar to artists, you can select the label by ID. 
- **Language**: Select the language.  
  - If the language isn't listed, please send feedback (contact information is in the sidebar).  
- **Cover Art**: Drag and drop, or click to select cover art.
- **Explicit Cover Art**: Select all that apply.
- **Add Tracks**: Click, then enter the number of tracks you want to add. Fill in the titles and (optionally) the length for each track.  
  - For compilations that consist of various artists, list the artist next to the song title. (see this [example](https://www.musictaste.xyz/release/tYKIC5MZ1R-F))
- **Note/Source**: Add a note for the person reviewing your contribution (include links).  
- **Submit**: Click **"Submit"** to add the release.  

### Importing from MusicBrainz

You can autofill the fields by importing from MusicBrainz.

- Go to [https://musicbrainz.org/](https://musicbrainz.org/)  
- Navigate to the **specific release** you want to add (not the release group — make sure it's a specific issue).  
- Copy the URL of that release page.  
- Paste it into the **MusicBrainz** field.  
- Click **"Import"**.  
- Edit and fill in any missing information as necessary.

## Adding Artists

- **Name**: The original name of the artist.
- **English / Latin-script name (if applicable)**: The name of the artist in English or Latin-script if the original name is in non-Latin script.
- **Type**: Select "Person" or "Group".
- **Disambiguation**: A very short description of the artist to distinguish them from other artists with the same name.
- **Members**: Members of the band, separated by commas. 
  - If members have pages in the database, use **references** to link them.
  - If members don't have pages in the database, write their names without linking them. (Don't create empty artist pages)
  - You can put active years in parentheses for former members or for members who joined later (e.g., 2018-22 or 2022-present).
- **Member Of**: Groups that the artist is a member of, separated by commas. If bands have pages in the database, use **references** to link them.
- **Related Artists**: Use references to link related artists, separated by commas. This should only be used for artists that are closely related, such as sub-units of a group.
- **AKA**: Alternative names, separated by commas. If the artist has a page for an alternative name, use a reference to link it. 
  - Creating separate artist pages for aliases is strongly discouraged unless the alias has a notable and distinct discography. Releases under one Bandcamp artist account should be added to a single artist page.
- **Note/Source**: Add a note for the person reviewing your contribution (include links).
- **Submit**: Click **"Submit"** to add the artist.

## Adding Genres

You can contribute genres from [this page](/contributions/genres/new).

- **Name**: The name of the genre.
- **Bio**: The bio of the genre (must not be copied from other sources / **supports references**).
- **Note/Source**: Add sources and a note for the person reviewing your contribution (must provide multiple sources).
- **Submit**: Click **"Submit"** to add the genre.

## Editing Data

You can edit releases, artists, and genres using a similar process:

- Go to the release, artist, or genre page you want to edit.  
- Click the dropdown menu in the top right corner and select **"Edit"**.  
- Make your changes and click **"Submit"**.  
- Edits may take up to 24 hours to be approved.

## References

You can reference releases, artists, labels, and genres by copying the reference from the top-right menu on their page and pasting it into supported fields. 

Example:
[[release/PWSPvqA2Vcc1]]
[[artist/cHIeGCCs9qH3]]
[[label/_mIOVkk01WAG]]
[[genre/TVja92bPs-jK]]
Will render as:
[Vespertine](${getReleasePath({ releaseId: 'PWSPvqA2Vcc1' })})
[Kendrick Lamar](${getArtistPath({ artistId: 'cHIeGCCs9qH3' })})
[Constellation](${getLabelPath({ labelId: '_mIOVkk01WAG' })})
[Post-Rock](${getGenrePath({ genreId: 'TVja92bPs-jK' })})

## Discarding Data Submissions

If you add or edit data by mistake (or accident), you can discard it within **1 hour** after submitting.

- Find the submission (multiple options)
  - You can fine all your contributions in **your contributions page** (from the top right menu in your profile page)
  - You can find **history pages** of releases, artists, labels, and genres in their own pages in the top right menu
- Click the **"Discard"** button.
- Confirm the action.

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
- **PENDING ENTITY DELETION**
  - AUTO APPROVED contribution has been disapproved and the linked data is now pending hard deletion.

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
      - Genres require 4+ upvotes out of 5 votes to be approved.
- **Editor**
  - Can add and edit music data directly without review.
  - Can approve or reject contributions submitted by other users.

## Feedback

We welcome your feedback and suggestions. You'll find our contact information and social media links in the sidebar.`;
