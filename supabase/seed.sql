insert into public.prompts (category, text_en, text_hi, difficulty, order_index, is_active)
values
-- Childhood
('childhood', 'Tell me about the home you grew up in. What did it look and feel like?', 'जिस घर में आप बड़े हुए, उसके बारे में बताइए। वह कैसा लगता था?', 'easy', 1, true),
('childhood', 'Who was your closest friend as a child? What did you do together?', 'बचपन में आपका सबसे करीबी दोस्त कौन था? आप साथ में क्या करते थे?', 'easy', 2, true),
('childhood', 'What is a smell, sound, or taste that instantly takes you back to your childhood?', 'कौन-सी खुशबू, आवाज़ या स्वाद आपको तुरंत बचपन में ले जाता है?', 'medium', 3, true),
('childhood', 'Tell me about a time you got in trouble as a kid—what happened?', 'बचपन में जब आप मुश्किल में पड़े थे, उसके बारे में बताइए—क्या हुआ था?', 'medium', 4, true),

-- Career
('career', 'What was your first job? How did you get it?', 'आपकी पहली नौकरी क्या थी? आपको वह कैसे मिली?', 'easy', 5, true),
('career', 'Tell me about a moment at work that made you feel proud.', 'काम में कौन-सा पल आपको सबसे ज़्यादा गर्व महसूस कराता है?', 'medium', 6, true),
('career', 'Was there a mentor or senior who shaped your career? What did they teach you?', 'क्या कोई मेंटॉर या सीनियर थे जिन्होंने आपके करियर को आकार दिया? उन्होंने क्या सिखाया?', 'medium', 7, true),
('career', 'What was the hardest decision you had to take in your career?', 'करियर में आपको सबसे कठिन फैसला कौन-सा लेना पड़ा?', 'deep', 8, true),

-- Family
('family', 'How did you and Mom/Dad meet? What do you remember about that time?', 'आप और मम्मी/पापा कैसे मिले? उस समय की क्या यादें हैं?', 'easy', 9, true),
('family', 'Tell me about a family tradition that mattered a lot to you.', 'परिवार की कोई परंपरा बताइए जो आपके लिए बहुत महत्वपूर्ण थी।', 'medium', 10, true),
('family', 'What was it like when your first child was born?', 'जब आपका पहला बच्चा पैदा हुआ था, तब कैसा लगा था?', 'medium', 11, true),
('family', 'What is something you wish you had said more often to your family?', 'कोई बात जो आप काश अपने परिवार से ज़्यादा बार कहते?', 'deep', 12, true),

-- Wisdom
('wisdom', 'What is one life lesson you learned the hard way?', 'आपने जीवन का कौन-सा सबक कठिन तरीके से सीखा?', 'deep', 13, true),
('wisdom', 'When you feel stressed, what helps you come back to calm?', 'जब आप तनाव में होते हैं, तो आपको शांति कैसे मिलती है?', 'medium', 14, true),
('wisdom', 'What do you want younger generations to remember about you?', 'आप चाहते हैं कि नई पीढ़ी आपको किस बात के लिए याद रखे?', 'deep', 15, true),
('wisdom', 'What does a “good life” mean to you now?', 'अब आपके लिए “अच्छा जीवन” का क्या मतलब है?', 'deep', 16, true),

-- Historical / witnessed events
('history', 'Tell me about a major event you witnessed that changed your life.', 'ऐसी कोई बड़ी घटना बताइए जो आपने देखी और जिसने आपका जीवन बदल दिया।', 'deep', 17, true),
('history', 'What was life like before smartphones and the internet?', 'स्मार्टफोन और इंटरनेट से पहले जीवन कैसा था?', 'easy', 18, true),
('history', 'Tell me about a festival memory you still feel in your bones.', 'किसी त्योहार की याद बताइए जो आज भी दिल में ताज़ा है।', 'medium', 19, true),
('history', 'Describe a time when money was tight—how did you manage as a family?', 'जब पैसों की तंगी थी, तब आपने परिवार के साथ कैसे संभाला?', 'deep', 20, true);
