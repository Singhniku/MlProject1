// Builds a Google Scholar author-search URL so the user can confirm a professor's
// current affiliation and recent papers before emailing.
export const ScholarLinkService = {
  authorSearch(name, university) {
    return (
      "https://scholar.google.com/citations?view_op=search_authors&mauthors=" +
      encodeURIComponent(name + " " + university)
    );
  },
};
