export default {
  title: (data) => data.title || data.site.title,
  description: (data) => data.description || data.site.description
};
