// About.jsx - Page "À propos de nous"
'use client';
import { motion } from 'framer-motion';
import { 
  Users, Shield, Award, Clock, CheckCircle, 
  Star, Heart, Target, Globe, TrendingUp 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Sécurité Garantie",
      description: "Tous nos prestataires sont vérifiés et assurés pour votre tranquillité d'esprit.",
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: Award,
      title: "Qualité Certifiée",
      description: "Nous maintenons des standards de qualité élevés avec des évaluations continues.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Clock,
      title: "Rapidité d'Intervention",
      description: "Services disponibles 24/7 avec des délais d'intervention optimisés.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Heart,
      title: "Satisfaction Client",
      description: "Notre priorité : votre satisfaction. Taux de satisfaction de 98%.",
      color: "from-pink-500 to-pink-600"
    }
  ];

  const milestones = [
    { year: "2020", title: "Fondation", description: "Création de la plateforme OnDemand" },
    { year: "2021", title: "Expansion", description: "Lancement dans 5 nouvelles villes" },
    { year: "2022", title: "Innovation", description: "Développement de l'application mobile" },
    { year: "2023", title: "Reconnaissance", description: "Prix de l'innovation digitale" },
    { year: "2024", title: "Croissance", description: "Plus de 10 000 clients satisfaits" },
  ];

  return (
    <>
      {/* Styles CSS personnalisés */}
      <style jsx global>{`
        /* Réduction des tailles générales */
        .about-container {
          font-size: 0.95rem;
        }
        
        /* Amélioration des cartes */
        .improved-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(229, 231, 235, 0.8);
          backdrop-filter: blur(10px);
        }
        
        .improved-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.1);
          border-color: rgba(20, 184, 166, 0.3);
        }
        
        /* Timeline améliorée */
        .timeline-dot {
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.9);
        }
        
        /* Section chiffres clés */
        .stats-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          position: relative;
          overflow: hidden;
        }
        
        .stats-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #0d9488, #3b82f6);
        }
        
        /* Témoignages */
        .testimonial-card {
          background: linear-gradient(145deg, #ffffff, #f1f5f9);
          border-radius: 1.5rem;
          position: relative;
        }
        
        .testimonial-quote {
          position: absolute;
          top: -20px;
          left: 30px;
          width: 40px;
          height: 40px;
          background: #0d9488;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        /* Responsive amélioré */
        @media (max-width: 768px) {
          .timeline-line {
            left: 30px !important;
          }
          
          .milestone-content {
            width: calc(100% - 80px) !important;
            margin-left: 80px !important;
            text-align: left !important;
            padding-left: 1.5rem !important;
            padding-right: 0 !important;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          
          .hero-title {
            font-size: 2.5rem !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white about-container">
        {/* Hero Section - Réduit */}
        <div className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-400/10 rounded-full translate-x-1/3 translate-y-1/3" />
          </div>
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                  <Target size={16} className="text-teal-200" />
                  <span className="text-sm font-medium text-teal-100">Notre Mission</span>
                </div>
                
                <h1 className="hero-title text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  À propos de{' '}
                  <span className="relative">
                    <span className="relative z-10 bg-gradient-to-r from-teal-200 to-white bg-clip-text text-transparent">
                      OnDemandApp
                    </span>
                    <span className="absolute bottom-2 left-0 w-full h-3 bg-teal-400/30 -rotate-1 z-0" />
                  </span>
                </h1>
                
                <p className="text-lg text-teal-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Nous transformons la façon dont vous accédez aux services professionnels, 
                  en combinant technologie, confiance et excellence.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Notre Impact en Chiffres</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Des résultats concrets qui témoignent de notre engagement
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 stats-grid">
              {[
                { value: "10K+", label: "Clients Satisfaits", icon: Users, color: "from-teal-500 to-emerald-500" },
                { value: "98%", label: "Satisfaction", icon: Star, color: "from-amber-500 to-orange-500" },
                { value: "24/7", label: "Disponibilité", icon: Clock, color: "from-blue-500 to-indigo-500" },
                { value: "500+", label: "Prestataires", icon: Shield, color: "from-purple-500 to-pink-500" },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="stats-card rounded-xl p-6 text-center improved-card"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon size={22} className="text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Notre Histoire */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Notre Histoire</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Découvrez le parcours qui nous a amenés à devenir leader dans les services à la demande
              </p>
            </div>

            {/* Timeline améliorée */}
            <div className="relative">
              <div className="timeline-line absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-teal-500 to-blue-500" />
              
              <div className="space-y-10">
                {milestones.map((milestone, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative"
                  >
                    <div className={`milestone-content w-1/2 ${idx % 2 === 0 ? 'ml-0 mr-auto pr-10 text-right' : 'ml-auto mr-0 pl-10'}`}>
                      <div className="improved-card bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <div className="text-2xl font-bold text-teal-600 mb-2">{milestone.year}</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{milestone.title}</h3>
                        <p className="text-gray-600 text-sm">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="timeline-dot absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-r from-teal-600 to-blue-600 border-4 border-white" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Nos Valeurs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Nos Valeurs</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Les principes qui guident chacune de nos actions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="improved-card bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-5`}>
                    <feature.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Section Témoignages - NOUVELLE SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Ce que disent nos clients</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Découvrez les expériences de ceux qui nous font confiance
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Marie Laurent",
                  role: "Directrice Marketing",
                  content: "Un service exceptionnel ! Rapidité et professionnalisme au rendez-vous. Je recommande vivement.",
                  rating: 5
                },
                {
                  name: "Thomas Martin",
                  role: "Entrepreneur",
                  content: "La qualité des prestataires est remarquable. Une plateforme fiable qui simplifie mon quotidien.",
                  rating: 5
                },
                {
                  name: "Sophie Bernard",
                  role: "Professionnelle libérale",
                  content: "Depuis que j'utilise OnDemandApp, je gagne un temps précieux. Interface intuitive et services de qualité.",
                  rating: 4
                }
              ].map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="testimonial-card p-7 improved-card"
                >
                  <div className="testimonial-quote">"</div>
                  <div className="flex items-center mb-5 pt-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg mr-4">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-teal-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${i < testimonial.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Notre Équipe */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Notre Équipe</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Des experts passionnés qui travaillent chaque jour pour vous offrir la meilleure expérience
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Sarah Chen", role: "CEO & Fondatrice", description: "15 ans d'expérience dans le digital" },
                { name: "Marc Dubois", role: "Directeur Technique", description: "Expert en technologie et innovation" },
                { name: "Fatima Alami", role: "Responsable Qualité", description: "Garant de l'excellence de nos services" },
              ].map((member, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="improved-card bg-white rounded-xl p-7 shadow-lg border border-gray-100 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 mx-auto mb-5 flex items-center justify-center text-white text-2xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-teal-600 font-medium mb-4 text-sm">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-10 border border-teal-100 improved-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Prêt à découvrir nos services ?</h2>
              <p className="text-lg text-gray-600 mb-7 max-w-2xl mx-auto">
                Rejoignez notre communauté de clients satisfaits et simplifiez votre accès aux services professionnels
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/client')}
                  className="px-7 py-3.5 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold rounded-lg hover:from-teal-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                >
                  Découvrir nos services
                </button>
                <button
                  onClick={() => {
                    navigate('/client#contact-section');
                    setTimeout(() => {
                      const contactSection = document.getElementById('contact-section');
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className="px-7 py-3.5 bg-white text-teal-600 font-bold rounded-lg border-2 border-teal-200 hover:bg-teal-50 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                >
                  Nous contacter
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}