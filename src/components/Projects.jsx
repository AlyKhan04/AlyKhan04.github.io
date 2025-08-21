import React from "react";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

// All data hardcoded here
const defaultProjects = [
  {
    title: "Handwritten Character Recognition",
    blurb:
      "CNN that recognizes hand-drawn A–Z characters with an interactive drawing canvas and a pretrained .keras model.",
    description:
      "A Jupyter Notebook project that trains a convolutional neural network on the A–Z Handwritten Alphabets dataset and supports real-time predictions via a canvas UI.",
    tags: ["Python", "CNN", "Keras", "Computer Vision", "Kaggle"],
    github: "https://github.com/AlyKhan04/HandwrittenCharacterRecognition",
    demo: "",
    // If your image is in public/images/, use a relative path (works on GitHub Pages):
    image: "images/HandwrittenCharacterDataset.png",
  },
  {
    title: "Credit Risk Neural Network (Java)",
    blurb:
      "Java neural network from scratch to predict loan approvals with 5-fold cross-validation and per-fold metrics.",
    description:
      "Implements a sigmoid-based feedforward NN in Java to classify loan acceptance on a credit-risk dataset, reporting accuracy, precision, recall, F1, confusion matrix, and loss/accuracy curves per fold.",
    tags: ["Java", "Neural Network", "K-Fold CV", "Binary Classification"],
    github: "https://github.com/AlyKhan04/CreditRiskNeuralNetwork",
    demo: "",
    image: "/images/CreditRiskDatasetImage.png", // e.g. "images/credit-risk.png"
  },
  {
    title: "Multi-Task Fashion (Class & Color)",
    blurb:
      "PyTorch multi-task model that jointly predicts clothing class and color using transfer learning and weighted losses.",
    description:
      "Trains a multi-task learning model on a clothing image dataset to predict category and color simultaneously; handles class imbalance with computed class weights and saves the best checkpoint.",
    tags: ["PyTorch", "Multi-Task Learning", "Transfer Learning", "Computer Vision"],
    github: "https://github.com/AlyKhan04/MTL-Fashion-Dataset",
    demo: "",
    image: "/images/MTC Model Output.png", // e.g. "images/mtl-fashion.png"
  },
];

function ProjectCard({ project }) {
  const { title, description, blurb, tags, github, demo, image } = project;

  return (
    <article className="group relative overflow-hidden p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:border-orange-400/60 transition">
      {/* Media */}
      <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-white/10 to-transparent mb-4">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-1 text-white">{title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-300">
        {description || blurb || "No description provided."}
      </p>

      {/* Tags */}
      {Array.isArray(tags) && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((t) => (
            <span
              key={t}
              className="px-2 py-1 text-xs rounded-md border border-white/10 bg-white/5 text-gray-200"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Links */}
      <div className="mt-4 flex items-center gap-3">
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <FaGithub /> <span className="text-sm">Code</span>
          </a>
        )}
        {demo && (
          <a
            href={demo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <FaExternalLinkAlt /> <span className="text-sm">Live</span>
          </a>
        )}
      </div>

      {/* Subtle hover aura */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
        <div className="absolute -inset-16 bg-gradient-to-tr from-orange-400/10 via-transparent to-transparent blur-3xl" />
      </div>
    </article>
  );
}

// Fully hardcoded page component (no props)
export default function Projects() {
  const list = defaultProjects;

  return (
    <section
      id="projects"
      className="relative z-10 text-white py-16 px-4 sm:px-8 lg:px-16 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase text-gray-400">work</p>
          <h2 className="text-2xl font-semibold">Projects</h2>
          <p className="text-gray-400 text-sm mt-1">
            A selection of things I’ve built outside University.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p, idx) => (
            <ProjectCard key={`${p.title}-${idx}`} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
