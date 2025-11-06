    name: { type: String, trim: true, default: "" },
    role: { type: String, trim: true, default: "" },
    file: { type: String, trim: true, default: null },


    date: { type: String, default: "" },
    time: { type: String, default: "" },
    ampm: { type: String, enum: ["AM", "PM"], default: "AM" },



        title: { type: String, trim: true },
    genres: [{ type: String }],
    duration: {
      hours: { type: Number, default: 0 },
      minutes: { type: Number, default: 0 },
    },
    year: { type: Number },
    description: { type: String, trim: true },
    thumbnail: { type: String, trim: true },
    videoId: { type: String, trim: true },



    type: {
      type: String,
      enum: ["normal", "featured", "releaseSoon", "latestTrailers"],
      default: "normal",
    },

    movieName: { type: String, trim: true },
    categories: [{ type: String }],
    poster: { type: String, trim: true },
    trailerUrl: { type: String, trim: true },
    videoUrl: { type: String, trim: true },
    rating: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },

    slots: [slotSchema],
    seatPrices: {
      standard: { type: Number, default: 0 },
      recliner: { type: Number, default: 0 },
    },

    auditorium: { type: String, trim: true, default: "Audi 1" },

    cast: [personSchema],
    directors: [personSchema],
    producers: [personSchema],

    story: { type: String, trim: true },