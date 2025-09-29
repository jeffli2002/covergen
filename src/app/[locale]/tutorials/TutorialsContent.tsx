'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, ChevronRight, CheckCircle } from 'lucide-react'
import { tutorialCategories } from '@/data/tutorials'

export default function TutorialsContent() {
  const [activeCategory, setActiveCategory] = useState('getting-started')
  const [expandedTutorials, setExpandedTutorials] = useState<Set<string>>(new Set())

  const toggleTutorial = (tutorialTitle: string) => {
    const newExpanded = new Set(expandedTutorials)
    if (newExpanded.has(tutorialTitle)) {
      newExpanded.delete(tutorialTitle)
    } else {
      newExpanded.add(tutorialTitle)
    }
    setExpandedTutorials(newExpanded)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-50 dark:via-indigo-50 dark:to-purple-50 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-thin tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Complete Tutorial Guide
            </h1>
            <p className="text-lg md:text-xl font-light leading-relaxed text-gray-700 dark:text-gray-700 mb-8">
              Master every aspect of AI-powered cover generation with our comprehensive tutorials
            </p>
            <div className="flex justify-center gap-4">
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-100 dark:text-emerald-700 border-0 px-4 py-1 text-sm font-light">
                {tutorialCategories.reduce((acc, cat) => acc + cat.tutorials.length, 0)} Tutorials
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-100 dark:text-blue-700 border-0 px-4 py-1 text-sm font-light">
                {tutorialCategories.length} Categories
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <h3 className="text-xl md:text-2xl font-light mb-4">Tutorial Categories</h3>
              {tutorialCategories.map((category) => {
                const Icon = category.icon
                const isActive = activeCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                      isActive
                        ? 'border-blue-300 bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-100 dark:border-blue-300 dark:text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-200 dark:hover:bg-gray-50 dark:hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors duration-200 ${
                        isActive ? 'bg-blue-200 dark:bg-blue-200' : 'bg-purple-100 dark:bg-purple-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-purple-700'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-medium">{category.title}</div>
                        <div className={`text-sm font-light ${isActive ? 'text-blue-600' : 'text-gray-600 dark:text-gray-600'}`}>
                          {category.tutorials.length} tutorials
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {tutorialCategories
                .filter(category => category.id === activeCategory)
                .map(category => (
                  <div key={category.id}>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-100 dark:to-purple-100 rounded-lg">
                        <category.icon className="w-6 h-6 text-blue-700 dark:text-blue-700" />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-extralight">{category.title}</h2>
                        <p className="text-base font-normal text-gray-600 dark:text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {category.tutorials.map((tutorial, index) => {
                        const isExpanded = expandedTutorials.has(tutorial.title)
                        return (
                          <Card key={index} className="overflow-hidden bg-white dark:bg-white border-gray-200 dark:border-gray-200">
                            <CardHeader 
                              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-50 transition-colors duration-200"
                              onClick={() => toggleTutorial(tutorial.title)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg font-medium mb-2 flex items-center gap-2">
                                    {tutorial.title}
                                    <ChevronRight className={`w-4 h-4 transition-transform ${
                                      isExpanded ? 'rotate-90' : ''
                                    }`} />
                                  </CardTitle>
                                  <p className="text-base font-normal text-gray-600 dark:text-gray-600">{tutorial.description}</p>
                                </div>
                                <Badge className={`ml-4 border-0 text-sm font-light ${
                                  tutorial.difficulty === 'Beginner' 
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-100 dark:text-emerald-700' 
                                    : tutorial.difficulty === 'Intermediate'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-100 dark:text-amber-700'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-100 dark:text-rose-700'
                                }`}>
                                  {tutorial.difficulty}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-1 text-sm font-light text-gray-600 dark:text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  {tutorial.duration}
                                </div>
                                <div className="flex gap-2">
                                  {tutorial.tags.slice(0, 3).map((tag, tagIndex) => (
                                    <Badge key={tagIndex} variant="secondary" className="text-xs font-normal bg-gray-100 dark:bg-gray-100 text-gray-700 dark:text-gray-700 border-0">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardHeader>
                            {isExpanded && (
                              <CardContent className="border-t border-gray-200 dark:border-gray-200">
                                <div className="pt-6 space-y-6">
                                  <div>
                                    <p className="text-base md:text-lg font-normal leading-relaxed mb-6 text-gray-700 dark:text-gray-700">{tutorial.content}</p>
                                  </div>
                                  {tutorial.steps && (
                                    <div className="space-y-4">
                                      <h3 className="text-xl md:text-2xl font-light mb-4">Step-by-Step Guide</h3>
                                      {tutorial.steps.map((step, stepIndex) => (
                                        <div key={stepIndex} className="flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-50 border border-gray-200 dark:border-gray-200">
                                          <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-100 text-blue-700 dark:text-blue-700 rounded-full flex items-center justify-center font-semibold">
                                              {stepIndex + 1}
                                            </div>
                                          </div>
                                          <div className="flex-1">
                                            <h4 className="text-base font-medium mb-1">{step.title}</h4>
                                            <p className="text-sm font-normal text-gray-600 dark:text-gray-600 leading-relaxed">
                                              {step.description}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="pt-4 border-t">
                                    <Button className="w-full sm:w-auto text-base font-medium">
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Mark as Completed
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}