# 🛡️ Teen Safety Features (Ages 13-17)

ConnectSphere supports users aged **13 and above** with comprehensive safety measures for teenagers.

## 🎯 Age Groups & Safety Levels

### Ages 13-14 (Enhanced Protection)
- **Age Range Matching**: ±2 years only (ages 11-16)
- **Session Limits**: 30 minutes per session, 2 hours daily
- **Safe Mode**: Mandatory (cannot be disabled)
- **Profanity Filter**: High (cannot be lowered)
- **Adult Matching**: Blocked entirely

### Ages 15-16 (Strong Protection)
- **Age Range Matching**: ±2 years only (ages 13-18)
- **Session Limits**: 45 minutes per session, 3 hours daily
- **Safe Mode**: Enabled by default (can be disabled with warning)
- **Profanity Filter**: High by default (can be lowered to medium)
- **Adult Matching**: Blocked entirely

### Ages 17 (Standard Protection)
- **Age Range Matching**: ±3 years (ages 14-20)
- **Session Limits**: 60 minutes per session, 4 hours daily
- **Safe Mode**: Enabled by default (can be disabled)
- **Profanity Filter**: High by default (can be adjusted)
- **Adult Matching**: Limited (max age 20)

## ✨ Automatic Teen Safety Features

### 1. Enhanced Content Filtering
```typescript
// Automatically applied for users under 18
- Profanity Filter: HIGH (most aggressive)
- Safe Mode: ENABLED (verified users only)
- Content Warnings: ENABLED
- Explicit Content: BLOCKED
```

### 2. Age-Appropriate Matching
```typescript
// Matching algorithm ensures:
- No matches with users 18+ for users under 16
- Maximum 2-3 year age difference
- Similar maturity level matching
- Geographic proximity prioritized
```

### 3. Session Time Limits
```typescript
// Automatic enforcement:
- Warning at 25/40/55 minutes (based on age)
- Auto-disconnect at limit
- Cool-down period between sessions
- Daily usage tracking
```

### 4. Priority Safety Monitoring
- Teen reports reviewed within **1 hour** (vs 24 hours for adults)
- Lower threshold for account suspension
- Proactive AI monitoring for concerning behavior
- Automatic intervention on safety keywords

## 🚨 Safety Guidelines (Displayed to Teens)

### Do NOT:
- ❌ Share personal information (address, phone, school name, last name)
- ❌ Share social media accounts
- ❌ Agree to meet strangers in person
- ❌ Share inappropriate photos or content
- ❌ Give out passwords or account information

### DO:
- ✅ Report inappropriate behavior immediately
- ✅ Tell a trusted adult if you feel uncomfortable
- ✅ Use the block feature liberally
- ✅ End conversations that make you uncomfortable
- ✅ Keep conversations on the platform (don't move to other apps)

## 📋 Implementation Checklist

### Frontend Components
- [x] `AgeVerification.tsx` - Age verification on signup
- [x] `TeenSafetyMode.tsx` - Safety guidelines modal
- [x] `TeenSafetyBanner.tsx` - Persistent safety reminder
- [x] Updated `SettingsScreen.tsx` - Age range starts at 13

### Backend Middleware
- [x] `teenSafety.js` - Teen safety rules enforcement
- [x] `applyTeenSafetyDefaults()` - Auto-apply safe settings
- [x] `validateTeenSafetyRules()` - Match validation
- [x] `getSessionTimeLimits()` - Time limit enforcement
- [x] `logTeenActivity()` - Safety monitoring logs

### Database Changes
- [x] Age range minimum changed from 18 to 13
- [x] Teen activity logging table
- [x] Enhanced safety settings defaults

## 🔧 Usage Examples

### Age Verification on Signup
```typescript
import { AgeVerification } from './components/AgeVerification';

const [showAgeVerification, setShowAgeVerification] = useState(true);
const [userAge, setUserAge] = useState<number | undefined>();

{showAgeVerification && (
  <AgeVerification
    onVerify={(age) => {
      setUserAge(age);
      setShowAgeVerification(false);
      // Save age to user profile
      apiService.updateUserSettings({ age });
    }}
    onCancel={handleCancel}
  />
)}
```

### Teen Safety Mode Display
```typescript
import { TeenSafetyMode, TeenSafetyBanner } from './components/TeenSafetyMode';

// Show on first login for teens
{showTeenSafety && userAge && userAge < 18 && (
  <TeenSafetyMode
    userAge={userAge}
    onAcknowledge={() => setShowTeenSafety(false)}
  />
)}

// Show banner during chat
{userAge && userAge < 18 && (
  <TeenSafetyBanner onViewGuidelines={handleViewGuidelines} />
)}
```

### Backend Safety Validation
```typescript
// In matching service
import { validateTeenSafetyRules, applyTeenSafetyDefaults } from './middleware/teenSafety.js';

// On user registration
applyTeenSafetyDefaults(userId);

// Before creating match
const validation = validateTeenSafetyRules(user1Id, user2Id);
if (!validation.allowed) {
  return { error: validation.reason };
}
```

## 📊 Monitoring & Reports

### Teen Activity Logging
All teen interactions are logged for safety:
- Match connections
- Messages sent/received
- Reports filed
- Session durations
- Blocks applied

### Report Priority
Teen reports get **priority review**:
- Standard: 24-hour review
- Teen: 1-hour review
- Urgent: Immediate review (violence, threats)

### Automated Interventions
System automatically:
- Flags concerning keywords
- Blocks suspicious accounts
- Notifies moderators
- Applies temporary restrictions

## 🌟 Best Practices

### For Parents/Guardians
1. Review safety guidelines with your teen
2. Encourage open communication about online experiences
3. Set expectations for usage time
4. Know how to access and review activity
5. Understand the reporting system

### For Teens
1. Always follow safety guidelines
2. Trust your instincts - if something feels wrong, it probably is
3. Report immediately, don't try to handle it yourself
4. Keep conversations appropriate
5. Never share personal information

### For Moderators
1. Prioritize teen reports
2. Be more cautious with teen safety violations
3. Document all actions taken
4. Escalate serious concerns immediately
5. Maintain zero-tolerance for predatory behavior

## 🚀 Legal Compliance

### COPPA (Children's Online Privacy Protection Act)
- ✅ Parental consent obtained for users under 13 (if applicable)
- ✅ Minimal data collection for minors
- ✅ No behavioral advertising to minors
- ✅ Strong data security measures

### International Standards
- ✅ GDPR compliance (Europe)
- ✅ Age verification requirements
- ✅ Data retention limits for minors
- ✅ Right to deletion

## 📞 Emergency Contacts

### For Users Needing Help
- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **Cyberbullying Hotline**: 1-800-273-8255
- **NCMEC CyberTipline**: 1-800-843-5678

### For Reporting Serious Issues
- In-app: Use enhanced report system
- Email: safety@connectsphere.com (Priority: Teen Safety)
- Emergency: Contact local law enforcement

---

## ✅ Testing Teen Safety Features

- [ ] Age verification blocks users under 13
- [ ] Teen safety modal appears for users 13-17
- [ ] Safe mode cannot be disabled for ages 13-14
- [ ] Age range matching enforces ±2-3 year limits
- [ ] Session time limits trigger correctly
- [ ] Daily usage limits enforced
- [ ] Teen reports prioritized
- [ ] Enhanced content filtering active
- [ ] Safety banner displays during chat
- [ ] Activity logging working

---

**Remember**: Teen safety is our #1 priority. When in doubt, always err on the side of caution.
